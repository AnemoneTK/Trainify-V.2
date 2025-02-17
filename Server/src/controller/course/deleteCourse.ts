import { Request, Response, CourseSchema } from "../../utils/constants";

const Course = CourseSchema;

export const deleteCourse = async (req: Request, res: Response) => {
  const { courseID } = req.body;

  // รับข้อมูลจาก session
  const sessionData = (req.session as any)?.userData;

  // ตรวจสอบว่า sessionData มีข้อมูลผู้ใช้หรือไม่
  if (!sessionData) {
    return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  // ตรวจสอบสิทธิ์ผู้ใช้จาก session
  if (!["admin", "super_admin"].includes(sessionData.role)) {
    return res.error(403, "คุณไม่มีสิทธิ์ในการลบหลักสูตร");
  }

  // ตรวจสอบว่า courseID ถูกระบุในคำขอหรือไม่
  if (!courseID) {
    return res.error(400, "กรุณาระบุ courseID");
  }

  try {
    // ค้นหาหลักสูตรจาก courseID
    const course = await Course.findById(courseID);
    if (!course) {
      return res.error(404, "ไม่พบหลักสูตรที่ระบุ");
    }

    // ตรวจสอบว่าหลักสูตรถูกลบไปแล้วหรือยัง
    if (course.status === "deleted") {
      return res.error(400, "หลักสูตรนี้ถูกลบไปแล้ว");
    }

    // เปลี่ยนสถานะหลักสูตรเป็น "deleted"
    course.status = "deleted";
    await course.save();

    // ส่งผลลัพธ์กลับไป
    return res.success("ลบหลักสูตรสำเร็จ");
  } catch (error) {
    const err = error as Error;
    return res.error(500, "ไม่สามารถลบหลักสูตรได้", err.message);
  }
};
