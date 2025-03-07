import {
  Request,
  Response,
  CourseSchema,
  UserSchema,
  JWT_SECRET,
  jwt,
  decryptData,
  nodemailer,
} from "../../utils/constants";
import Registration from "../../models/registrationSchema";
import User from "../../models/userSchema";
import Course from "../../models/courseSchema";

export const confirmTrainingResults = async (req: Request, res: Response) => {
  try {
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }

    // ตรวจสอบสิทธิ์เฉพาะ admin เท่านั้น
    if (sessionData.role !== "admin") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการยืนยันผลการอบรม");
    }

    const { courseId, results } = req.body;
    if (!courseId || !results) {
      return res.error(400, "กรุณาระบุ courseId และผลการอบรมให้ครบถ้วน");
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.error(404, "ไม่พบคอร์ส");
    }

    for (const { id, result } of results) {
      const user = await User.findById(id);
      if (!user) {
        continue; // ถ้าไม่พบให้ข้ามไป
      }

      const registration = await Registration.findOne({
        courseId: courseId,
        userId: id,
        status: "wait",
      });

      if (registration) {
        if (result === "passed") {
          registration.status = "passed";
          registration.passedAt = new Date();
          registration.expiryDate = new Date(registration.passedAt);
          registration.expiryDate.setFullYear(
            registration.passedAt.getFullYear() + 1
          );
        } else if (result === "not-attended") {
          registration.status = "not-attended";
          registration.passedAt = new Date();
          // คุณอาจไม่ต้องกำหนด expiryDateสำหรับกรณีนี้
        } else {
          registration.status = "failed";
          registration.passedAt = new Date();
        }
        await registration.save();

        await sendResultEmail(
          decryptData(user.email),
          decryptData(user.firstName),
          course.title,
          result
        );
      }
    }
    // หลังจากยืนยันผลการอบรมแล้ว ให้เปลี่ยนสถานะหลักสูตรเป็น "close"
    await Course.findByIdAndUpdate(courseId, { status: "close" });
    console.log(`หลักสูตรที่มี ID ${courseId} ถูกอัปเดตสถานะเป็น "close"`);
    return res.success("ยืนยันผลการอบรมสำเร็จ");
  } catch (error) {
    const err = error as Error;
    console.error("Error confirming training results:", err.message);
    return res.error(500, "เกิดข้อผิดพลาดในการยืนยันผลการอบรม", err.message);
  }
};

const sendResultEmail = async (
  email: string,
  firstName: string,
  courseTitle: string,
  result: string
) => {
  const subject =
    result === "passed"
      ? "คุณผ่านการอบรม"
      : result === "not-attended"
      ? "คุณไม่ได้เข้ารับการอบรม"
      : "คุณไม่ผ่านการอบรม";
  const resultMessage =
    result === "passed"
      ? `ยินดีด้วย! คุณได้ผ่านการอบรมคอร์ส ${courseTitle} สำเร็จแล้ว`
      : result === "not-attended"
      ? `คุณไม่ได้เข้ารับการอบรมคอร์ส ${courseTitle}`
      : `ขอแสดงความเสียใจ! คุณไม่ผ่านการอบรมคอร์ส ${courseTitle}`;

  const mailOptions = {
    from: "Trainify Project <no-reply@trainify.com>",
    to: email,
    subject: subject,
    html: `
      <p>สวัสดีคุณ ${firstName},</p>
      <p>${resultMessage}</p>
      <p>ขอบคุณ,<br>ทีมงาน Trainify</p>
    `,
  };

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.Trainify_Email,
        pass: process.env.Trainify_Email_Password,
      },
    });

    await transporter.sendMail(mailOptions);
    console.log(`อีเมลแจ้งเตือนผลการอบรมถูกส่งไปยัง: ${email}`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};
