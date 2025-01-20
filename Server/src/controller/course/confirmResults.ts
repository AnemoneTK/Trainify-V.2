import {
  Request,
  Response,
  jwt,
  JwtPayload,
  CourseSchema,
  UserSchema,
  UserLogSchema,
  JWT_SECRET,
  nodemailer,
  decryptData,
} from "../../utils/constants";

import Registration from "../../models/registrationSchema";
import User from "../../models/userSchema";
import Course from "../../models/courseSchema";

export const confirmTrainingResults = async (req: Request, res: Response) => {
  const { courseId, results } = req.body;
  const authHeader = req.cookies?.token;

  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;

    if (decodedToken.role !== "admin") {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการยืนยันผลการอบรม",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "Error",
        message: "ไม่พบคอร์ส",
      });
    }

    for (const { id, result } of results) {
      const user = await User.findById(id);
      if (!user) {
        continue; //ถ้าไม่เจอข้ามไป
      }

      const registration = await Registration.findOne({
        courseId: courseId,
        userId: id,
        status: "registered",
      });

      if (registration) {
        registration.status = result === "passed" ? "passed" : "failed";
        registration.passedAt = new Date();

        if (registration.status === "passed") {
          registration.expiryDate = new Date(registration.passedAt);
          registration.expiryDate.setFullYear(
            registration.passedAt.getFullYear() + 1
          );
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

    return res.status(200).json({
      status: "Success",
      message: "ยืนยันผลการอบรมสำเร็จ",
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error confirming training results:", error);
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการยืนยันผลการอบรม",
      error: err.message,
    });
  }
};

const sendResultEmail = async (
  email: string,
  firstName: string,
  courseTitle: string,
  result: string
) => {
  const subject = result === "passed" ? "คุณผ่านการอบรม" : "คุณไม่ผ่านการอบรม";
  const resultMessage =
    result === "passed"
      ? `ยินดีด้วย! คุณได้ผ่านการอบรมคอร์ส ${courseTitle} สำเร็จแล้ว`
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
