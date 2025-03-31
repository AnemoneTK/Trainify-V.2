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
  const Trainify_Email = process.env.Trainify_Email;
  const Trainify_Password = process.env.Trainify_Email_Password;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: Trainify_Email,
      pass: Trainify_Password,
    },
  });

  const formattedExpiryDate = expiryDate.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let subject = "";
  let message = "";

  if (status === "expiring") {
    subject = `แจ้งเตือน: คอร์ส ${courseTitle} กำลังใกล้หมดอายุ`;
    message = `
      <p>สวัสดีคุณ ${userName},</p>
      <p>คอร์ส <strong>${courseTitle}</strong> ที่คุณลงทะเบียนจะหมดอายุในวันที่ <strong>${formattedExpiryDate}</strong></p>
      <p>กรุณาตรวจสอบสถานะของหลักสูตร และติดต่อพนักงานผู้ดูแลหากคุณต้องการต่ออายุคอร์สของคุณ.</p>
      <p>ขอบคุณ,<br>ทีมงาน Trainify</p>
    `;
  } else if (status === "expired") {
    subject = `แจ้งเตือน: คอร์ส ${courseTitle} หมดอายุแล้ว`;
    message = `
      <p>สวัสดีคุณ ${userName},</p>
      <p>คอร์ส <strong>${courseTitle}</strong> ที่คุณลงทะเบียนหมดอายุแล้วเมื่อวันที่ <strong>${formattedExpiryDate}</strong></p>
      <p>หากคุณต้องการใช้งานคอร์สนี้ กรุณาติดต่อพนักงานผู้ดูแลเพื่อทำการต่ออายุคอร์สของคุณ.</p>
      <p>ขอบคุณ,<br>ทีมงาน Trainify</p>
    `;
  }

  const mailOptions = {
    from: "Trainify Project <no-reply@trainify.com>",
    to: email,
    subject: subject,
    html: message,
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
