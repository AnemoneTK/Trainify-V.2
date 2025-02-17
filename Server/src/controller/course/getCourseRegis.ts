import { Request, Response, CourseSchema } from "../../utils/constants";
import RegisterSchema from "../../models/registrationSchema";

const Course = CourseSchema;
const Registration = RegisterSchema;

export const getCourseRegistrations = async (req: Request, res: Response) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.error(400, "กรุณาระบุ courseId");
  }

  try {
    // ค้นหาหลักสูตรจาก courseId
    const course = await Course.findById(courseId);
    if (!course) {
      return res.error(404, "ไม่พบหลักสูตร");
    }

    // ค้นหาการลงทะเบียนทั้งหมดสำหรับหลักสูตรนี้
    const registrations = await Registration.find({ courseId })
      .populate("userId") // ดึงข้อมูลผู้ใช้ที่ลงทะเบียน
      .sort({ date: 1, "timeSlot.start": 1 }); // เรียงตามวันที่และเวลาเริ่มต้น

    if (!registrations || registrations.length === 0) {
      return res.error(404, "ไม่มีผู้ลงทะเบียนในหลักสูตรนี้");
    }

    // จัดกลุ่มการลงทะเบียนตามวันที่ (ใช้ toLocaleDateString สำหรับการแปลงวันที่)
    const groupedByDate: Record<string, any[]> = registrations.reduce(
      (acc, registration) => {
        const dateKey = new Date(registration.date).toLocaleDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push({
          timeSlot: registration.timeSlot,
          user: registration.userId,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    return res.success("ดึงข้อมูลการลงทะเบียนสำเร็จ", {
      count: registrations.length,
      data: groupedByDate,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching course registrations:", err.message);
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน",
      err.message
    );
  }
};
