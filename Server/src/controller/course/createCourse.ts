import {
  Request,
  Response,
  UserSchema,
  CourseSchema,
} from "../../utils/constants";

const Course = CourseSchema;

export const createCourse = async (req: Request, res: Response) => {
  try {
    // ตรวจสอบ session
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }

    // ตรวจสอบสิทธิ์เฉพาะ Admin เท่านั้น
    if (sessionData.role !== "admin") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการสร้างหลักสูตร");
    }

    // ดึงข้อมูลจาก req.body
    const {
      title,
      description,
      schedule,
      dueDate,
      place,
      type,
      instructors,
      tag,
      status,
      banner,
    } = req.body;

    const now = new Date();
    const dueDateEnd = new Date(dueDate.end);

    // ตรวจสอบวันปิดรับสมัครต้องเป็นอนาคต
    if (dueDateEnd < now) {
      return res.error(400, "วันที่ปิดรับสมัครต้องไม่ใช่วันที่ผ่านมาแล้ว");
    }

    // ตรวจสอบว่าวันเริ่มเรียนต้องอยู่หลังจากวันปิดรับสมัคร
    for (const item of schedule) {
      const scheduleDate = new Date(item.date);
      if (scheduleDate < dueDateEnd) {
        return res.error(
          400,
          `วันเริ่มเรียน (${
            scheduleDate.toISOString().split("T")[0]
          }) ต้องอยู่หลังจากวันปิดรับสมัคร (${
            dueDateEnd.toISOString().split("T")[0]
          })`
        );
      }
    }

    // ตรวจสอบข้อมูลสถานที่สำหรับหลักสูตร Offline
    if (
      type === "offline" &&
      (!place || !place.description || place.description.trim() === "")
    ) {
      return res.error(
        400,
        "กรุณาระบุข้อความบอกสถานที่เมื่อจัดอบรมแบบ Offline"
      );
    }

    // สร้างหลักสูตรใหม่
    const newCourse = new Course({
      title,
      description,
      schedule,
      dueDate,
      place,
      type,
      instructors,
      tag,
      status: status || "public",
      createdBy: {
        userId: sessionData.id,
        fullName: sessionData.fullName,
        role: sessionData.role,
      },
      banner,
    });

    await newCourse.save();

    return res.success("สร้างหลักสูตรสำเร็จ", {
      course: newCourse,
    });
  } catch (error) {
    console.error("Error in createCourse:", error);
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการสร้างหลักสูตร",
      (error as Error).message
    );
  }
};
