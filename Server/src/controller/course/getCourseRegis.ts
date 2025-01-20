import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  CourseSchema,
  decryptData,
  JWT_SECRET,
} from "../../utils/constants";

import RegisterSchema from "../../models/registrationSchema";
const User = UserSchema;
const Course = CourseSchema;
const Registration = RegisterSchema;
export const getCourseRegistrations = async (req: Request, res: Response) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({
      status: "Error",
      message: "กรุณาระบุ courseId",
    });
  }

  try {
    // ค้นหาหลักสูตร
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        status: "Not Found",
        message: "ไม่พบหลักสูตร",
      });
    }

    // ค้นหาผู้ลงทะเบียนทั้งหมดสำหรับหลักสูตรนี้
    const registrations = await Registration.find({ courseId })
      .populate("userId") // ดึงข้อมูลผู้ใช้
      .sort({ date: 1, "timeSlot.start": 1 }); // เรียงตามวันที่และเวลาเริ่มต้น

    if (registrations.length === 0) {
      return res.status(404).json({
        status: "Not Found",
        message: "ไม่มีผู้ลงทะเบียนในหลักสูตรนี้",
      });
    }

    // จัดกลุ่มการลงทะเบียนตามวันที่
    const groupedByDate = registrations.reduce((acc: any, registration) => {
      const date = registration.date.toLocaleDateString(); // แปลงวันที่เป็น string (รูปแบบที่ต้องการ)
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        timeSlot: registration.timeSlot,
        user: registration.userId,
      });
      return acc;
    }, {});

    // ส่งผลลัพธ์ที่จัดกลุ่มตามวันที่และเวลา
    return res.status(200).json({
      status: "Success",
      message: "ดึงข้อมูลการลงทะเบียนสำเร็จ",
      data: groupedByDate,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching course registrations:", err.message);
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน",
      error: err.message,
    });
  }
};
