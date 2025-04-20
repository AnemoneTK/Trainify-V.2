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
  let subject, headerClass, resultMessage;

  // กำหนดค่าตามผลการอบรม
  if (result === "passed") {
    subject = `ยินดีด้วย! คุณผ่านการอบรม ${courseTitle}`;
    headerClass = "success";
    resultMessage = `ยินดีด้วย! คุณได้ผ่านการอบรมคอร์ส <strong>${courseTitle}</strong> สำเร็จแล้ว`;
  } else if (result === "not-attended") {
    subject = `คุณไม่ได้เข้ารับการอบรม ${courseTitle}`;
    headerClass = "warning";
    resultMessage = `คุณไม่ได้เข้ารับการอบรมคอร์ส <strong>${courseTitle}</strong>`;
  } else {
    subject = `ผลการอบรม: ไม่ผ่านการอบรม ${courseTitle}`;
    headerClass = "danger";
    resultMessage = `ขอแสดงความเสียใจ! คุณไม่ผ่านการอบรมคอร์ส <strong>${courseTitle}</strong>`;
  }

  const mailOptions = {
    from: "Trainify Project <no-reply@trainify.com>",
    to: email,
    subject: subject,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Kanit', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .email-header {
          background-color: #3498db;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .email-header.success {
          background-color: #2ecc71;
        }
        .email-header.warning {
          background-color: #f39c12;
        }
        .email-header.danger {
          background-color: #e74c3c;
        }
        .email-content {
          padding: 30px;
          color: #333333;
          line-height: 1.6;
        }
        .email-footer {
          background-color: #f9f9f9;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #777777;
          border-top: 1px solid #e0e0e0;
        }
        .button {
          display: inline-block;
          background-color: #3498db;
          color: #ffffff;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 15px 0;
        }
        .button.success {
          background-color: #2ecc71;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header ${headerClass}">
          <h2 style="margin: 0;">${subject}</h2>
        </div>
        <div class="email-content">
          <p>สวัสดีคุณ ${firstName},</p>
          <p>${resultMessage}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="button ${result === "passed" ? "success" : ""}">
              ${
                result === "passed"
                  ? "ดูประวัติการอบรม"
                  : "ลงทะเบียนคอร์สอีกครั้ง"
              }
            </a>
          </div>
          
          <p>${
            result === "passed"
              ? "เราหวังว่าคุณจะนำความรู้ที่ได้รับไปใช้ให้เกิดประโยชน์สูงสุด"
              : "หากคุณมีข้อสงสัยเกี่ยวกับผลการอบรม กรุณาติดต่อผู้ดูแลระบบ"
          }</p>
        </div>
        <div class="email-footer">
          <p>© ${new Date().getFullYear()} Trainify. สงวนลิขสิทธิ์.</p>
          <p>หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อทีมสนับสนุน</p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.TRAINIFY_EMAIL,
        pass: process.env.TRAINIFY_EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail(mailOptions);
    console.log(`อีเมลแจ้งเตือนผลการอบรมถูกส่งไปยัง: ${email}`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};
