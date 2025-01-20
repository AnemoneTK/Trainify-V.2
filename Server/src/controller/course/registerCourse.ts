import {
  Request,
  Response,
  bcrypt,
  jwt,
  JwtPayload,
  UserSchema,
  CourseSchema,
  UserLogSchema,
  LoginLogSchema,
  encryptData,
  decryptData,
  otpGenerator,
  nodemailer,
  JWT_SECRET,
} from "../../utils/constants";

import RegistrationSchema from "../../models/registrationSchema";
const Registration = RegistrationSchema;
const Course = CourseSchema;
const User = UserSchema;

export const registerCourse = async (req: Request, res: Response) => {
  const { courseId, date, timeSlot } = req.body;
  const authHeader = req.cookies?.token;

  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    const userId = decodedToken.id;

    // ค้นหาคอร์ส
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "Error",
        message: "ไม่พบหลักสูตร",
      });
    }

    if (course.status === "deleted") {
      return res.status(400).json({
        status: "Error",
        message: "คอร์สนี้ถูกลบแล้ว ไม่สามารถลงทะเบียนได้",
      });
    }

    if (course.status === "close") {
      return res.status(400).json({
        status: "Error",
        message: "คอร์สนี้ปิดรับสมัครแล้ว ไม่สามารถลงทะเบียนได้",
      });
    }
    const requestedDate = new Date(date);
    const currentDate = new Date();

    if (requestedDate < currentDate) {
      return res.status(400).json({
        status: "Error",
        message:
          "วันที่ไม่สามารถลงทะเบียนได้ วันที่ต้องเป็นวันปัจจุบันหรือวันในอนาคตเท่านั้น",
      });
    }

    const requestedStartTime = new Date(timeSlot.start);
    const requestedEndTime = new Date(timeSlot.end);

    // ค้นหาช่วงเวลาที่ตรงกับคอร์ส
    const timeSlotFound = course.schedule
      .find((slot) => {
        const courseDate = new Date(slot.date).toISOString().split("T")[0];
        const requestDate = new Date(date).toISOString().split("T")[0];
        return courseDate === requestDate; // ตรวจสอบว่าเป็นวันเดียวกันหรือไม่
      })
      ?.times.find((time) => {
        const courseStartTime = new Date(time.start);
        const courseEndTime = new Date(time.end);
        return (
          requestedStartTime.getTime() === courseStartTime.getTime() &&
          requestedEndTime.getTime() === courseEndTime.getTime()
        );
      });

    if (!timeSlotFound) {
      return res.status(400).json({
        status: "Error",
        message: "ไม่พบช่วงเวลานี้ในหลักสูตร",
      });
    }
    const conflictingRegistration = await Registration.findOne({
      userId,
      date,
      "timeSlot.start": { $lt: requestedEndTime },
      "timeSlot.end": { $gt: requestedStartTime },
    });

    if (conflictingRegistration) {
      return res.status(400).json({
        status: "Error",
        message: "เวลานี้ซ้อนทับกับการลงทะเบียนคอร์สอื่น",
      });
    }

    // ตรวจสอบการลงทะเบียนเดิมของผู้ใช้
    const existingRegistration = await Registration.findOne({
      courseId,
      userId,
      status: "registered",
    });

    if (existingRegistration) {
      return res.status(400).json({
        status: "Error",
        message: "คุณได้ลงทะเบียนคอร์สนี้แล้ว",
      });
    }
    const passedRegistration = await Registration.findOne({
      courseId,
      userId,
      date,
      "timeSlot.start": timeSlot.start,
      "timeSlot.end": timeSlot.end,
      status: "passed",
    });
    if (passedRegistration) {
      passedRegistration.status = "extend";
      await passedRegistration.save();
    }

    // ตรวจสอบจำนวนที่นั่งในช่วงเวลานี้
    const currentRegistrations = await Registration.countDocuments({
      courseId,
      date,
      "timeSlot.start": timeSlot.start,
      "timeSlot.end": timeSlot.end,
    });

    if (currentRegistrations >= timeSlotFound.seat) {
      return res.status(400).json({
        status: "Error",
        message: "ที่นั่งในช่วงเวลานี้เต็มแล้ว",
      });
    }

    // สร้างการลงทะเบียนใหม่
    const newRegistration = new Registration({
      courseId,
      userId,
      date,
      timeSlot,
      status: "registered", // สถานะใหม่คือ "registered"
    });

    await newRegistration.save();

    // ส่งอีเมลแจ้งเตือนการลงทะเบียน
    const user = await User.findById(userId);
    if (user && course) {
      await sendRegistrationEmail(
        decryptData(user.email),
        course.title,
        date,
        timeSlot,
        course.type,
        course.place ? course.place.description : "",
        decryptData(user.firstName)
      );
    }

    return res.status(200).json({
      status: "Success",
      message: "ลงทะเบียนคอร์สสำเร็จ",
      registration: newRegistration,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error during registration process:", error);
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการลงทะเบียนคอร์ส",
      error: err.message,
    });
  }
};

const sendRegistrationEmail = async (
  email: string,
  courseTitle: string,
  date: string,
  timeSlot: { start: string; end: string },
  courseType: string,
  place: string,
  userName: string
) => {
  console.log("Sending email to:", email);
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

  const mailOptions = {
    from: "Trainify Project <no-reply@trainify.com>",
    to: email,
    subject: `ยืนยันการลงทะเบียนคอร์ส ${courseTitle}`,
    html: `
      <p>สวัสดีคุณ ${userName},</p>
      <p>คุณได้ลงทะเบียนคอร์ส <strong>${courseTitle}</strong> สำเร็จแล้ว</p>
      <p>วันที่: ${new Date(date).toLocaleDateString()}</p>
      <p>เวลา: ${new Date(timeSlot.start).toLocaleTimeString()} - ${new Date(
      timeSlot.end
    ).toLocaleTimeString()}</p>
      <p>ประเภท: ${courseType}</p>
      <p>สถานที่: ${place}</p>
      <p>ขอบคุณ,<br>ทีมงาน Trainify</p>
    `,
  };

  try {
    console.log("Sending email...");
    await transporter.sendMail(mailOptions);
    console.log("อีเมลแจ้งเตือนการลงทะเบียนถูกส่งไปยัง:", email);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};
