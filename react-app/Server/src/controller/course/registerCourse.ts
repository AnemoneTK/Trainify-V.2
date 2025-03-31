import {
  Request,
  Response,
  UserSchema,
  CourseSchema,
  decryptData,
} from "../../utils/constants";
import nodemailer from "nodemailer";
import registrationSchema from "../../models/registrationSchema";
const Registration = registrationSchema;
const Course = CourseSchema;
const User = UserSchema;
import dayjs from "dayjs";

export const registerCourse = async (req: Request, res: Response) => {
  const { courseId, date, timeSlot } = req.body;
  const sessionData = (req.session as any)?.userData;

  if (!sessionData) {
    return res.error(401, "ไม่พบข้อมูลผู้ใช้ใน session");
  }

  const userId = sessionData.id;

  try {
    // ค้นหาคอร์ส
    const course = await Course.findById(courseId);
    if (!course) {
      return res.error(404, "ไม่พบหลักสูตร");
    }

    if (course.status === "deleted") {
      return res.error(400, "คอร์สนี้ถูกลบแล้ว ไม่สามารถลงทะเบียนได้");
    }

    if (course.status === "close") {
      return res.error(400, "คอร์สนี้ปิดรับสมัครแล้ว ไม่สามารถลงทะเบียนได้");
    }

    const requestedDate = new Date(date);
    const currentDate = new Date();

    if (requestedDate < currentDate) {
      return res.error(
        400,
        "วันที่ไม่สามารถลงทะเบียนได้ วันที่ต้องเป็นวันปัจจุบันหรือวันในอนาคตเท่านั้น"
      );
    }

    // ตรวจสอบการลงทะเบียนเดิมของผู้ใช้
    const existingRegistration = await Registration.findOne({
      courseId,
      userId,
      status: "registered",
    });

    if (existingRegistration) {
      return res.error(400, "คุณได้ลงทะเบียนคอร์สนี้แล้ว");
    }

    const requestedStartTime = dayjs(timeSlot.start).startOf("minute");
    const requestedEndTime = dayjs(timeSlot.end).startOf("minute");

    // ค้นหาช่วงเวลาที่ตรงกับคอร์ส
    const timeSlotFound = course.schedule
      .find((slot) => {
        const courseDate = dayjs(slot.date).format("YYYY-MM-DD"); // ใช้ dayjs เพื่อจัดการเวลา
        const requestDate = dayjs(date).format("YYYY-MM-DD");
        return courseDate === requestDate; // ตรวจสอบว่าเป็นวันเดียวกันหรือไม่
      })
      ?.times.find((time) => {
        const courseStartTime = dayjs(time.start).startOf("minute");
        const courseEndTime = dayjs(time.end).startOf("minute");
        return (
          requestedStartTime.isSame(courseStartTime) &&
          requestedEndTime.isSame(courseEndTime)
        );
      });

    if (!timeSlotFound) {
      return res.error(400, "ไม่พบช่วงเวลานี้ในหลักสูตร");
    }

    const conflictingRegistration = await Registration.findOne({
      userId,
      date,
      "timeSlot.start": { $lt: requestedEndTime },
      "timeSlot.end": { $gt: requestedStartTime },
    });

    if (conflictingRegistration) {
      return res.error(400, "เวลานี้ซ้อนทับกับการลงทะเบียนคอร์สอื่น");
    }

    // ตรวจสอบจำนวนที่นั่งในช่วงเวลานี้
    const currentRegistrations = await Registration.countDocuments({
      courseId,
      date,
      "timeSlot.start": timeSlot.start,
      "timeSlot.end": timeSlot.end,
    });

    if (currentRegistrations >= timeSlotFound.seat) {
      return res.error(400, "ที่นั่งในช่วงเวลานี้เต็มแล้ว");
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

    // อัพเดตจำนวน registeredSeats ใน timeSlot
    const updatedTimeSlot = course.schedule
      .find((slot) => {
        const courseDate = dayjs(slot.date).format("YYYY-MM-DD");
        const requestDate = dayjs(date).format("YYYY-MM-DD");
        return courseDate === requestDate;
      })
      ?.times.find((time) => {
        const courseStartTime = dayjs(time.start).startOf("minute");
        const courseEndTime = dayjs(time.end).startOf("minute");
        return (
          requestedStartTime.isSame(courseStartTime) &&
          requestedEndTime.isSame(courseEndTime)
        );
      });

    if (updatedTimeSlot) {
      updatedTimeSlot.registeredSeats += 1; // เพิ่มจำนวนที่นั่งที่ลงทะเบียน
      await course.save(); // บันทึกการอัพเดตในฐานข้อมูล
    }

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

    return res.success("ลงทะเบียนคอร์สสำเร็จ", {
      registration: newRegistration,
    });
  } catch (error) {
    console.error("Error during registration process:", error);
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการลงทะเบียนคอร์ส",
      (error as Error).message
    );
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
    await transporter.sendMail(mailOptions);
    console.log("อีเมลแจ้งเตือนการลงทะเบียนถูกส่งไปยัง:", email);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};
