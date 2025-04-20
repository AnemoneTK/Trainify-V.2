import nodemailer from "nodemailer";
import Registration from "../../models/registrationSchema";
import User from "../../models/userSchema";
import Course from "../../models/courseSchema";

const sendExpiryReminderEmail = async (
  email: string,
  userName: string,
  courseTitle: string,
  expiryDate: Date,
  status: string
) => {
  const TRAINIFY_EMAIL = process.env.TRAINIFY_EMAIL;
  const Trainify_Password = process.env.TRAINIFY_EMAIL_PASSWORD;

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: TRAINIFY_EMAIL,
      pass: Trainify_Password,
    },
  });

  const formattedExpiryDate = expiryDate.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let subject, headerClass;

  if (status === "expiring") {
    subject = `แจ้งเตือน: คอร์ส ${courseTitle} กำลังใกล้หมดอายุ`;
    headerClass = "warning";
  } else if (status === "expired") {
    subject = `แจ้งเตือน: คอร์ส ${courseTitle} หมดอายุแล้ว`;
    headerClass = "danger";
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
          color: #ffffff;
          padding: 20px;
          text-align: center;
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
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 15px 0;
          color: #ffffff;
        }
        .button.warning {
          background-color: #f39c12;
        }
        .button.danger {
          background-color: #e74c3c;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header ${headerClass}">
          <h2 style="margin: 0;">${subject}</h2>
        </div>
        <div class="email-content">
          <p>สวัสดีคุณ ${userName},</p>
          <p>คอร์ส <strong>${courseTitle}</strong> ที่คุณลงทะเบียน${
      status === "expiring" ? "จะหมดอายุในวันที่" : "หมดอายุแล้วเมื่อวันที่"
    } <strong>${formattedExpiryDate}</strong></p>
          <p>${
            status === "expiring"
              ? "กรุณาตรวจสอบสถานะของหลักสูตร และติดต่อพนักงานผู้ดูแลหากคุณต้องการต่ออายุคอร์สของคุณ"
              : "หากคุณต้องการใช้งานคอร์สนี้ กรุณาติดต่อพนักงานผู้ดูแลเพื่อทำการต่ออายุคอร์สของคุณ"
          }</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="button ${headerClass}">ต่ออายุคอร์ส</a>
          </div>
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
    await transporter.sendMail(mailOptions);
    console.log(`ส่งอีเมลแจ้งเตือนไปยัง ${email}`);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};

// ฟังก์ชันตรวจสอบและส่งอีเมลแจ้งเตือนทุกๆ วัน
export const checkExpiryAndNotify = async () => {
  const now = new Date();
  const twoMonthsFromNow = new Date(now.setMonth(now.getMonth() + 2)); // วันครบ 2 เดือน

  // ค้นหาผู้ใช้ที่มีการลงทะเบียนที่ใกล้หมดอายุ
  const registrations = await Registration.find({
    expiryDate: { $lte: twoMonthsFromNow },
    status: "passed", // เฉพาะผู้ที่ผ่านการอบรม
  });

  for (const registration of registrations) {
    const user = await User.findById(registration.userId);
    if (user) {
      const course = await Course.findById(registration.courseId);
      if (course) {
        if (registration && registration.expiryDate) {
          const status = registration.expiryDate < now ? "expired" : "expiring";
          // ส่งอีเมลแจ้งเตือน
          await sendExpiryReminderEmail(
            user.email,
            user.firstName,
            course.title,
            registration.expiryDate,
            status
          );
        } else {
          console.error("Expiry date is not set for this registration");
        }
      }
    }
  }
};
