import { Request, Response, CourseSchema } from "../../utils/constants";
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

    // ตรวจสอบว่า dueDate และ dueDate.end มีค่า
    if (!dueDate || !dueDate.end) {
      return res.error(400, "กรุณาระบุวันที่ปิดรับสมัคร");
    }

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

      // ตรวจสอบเวลาซ้ำกันในวันเดียวกัน
      const timeSlots = item.times;

      // เปรียบเทียบเวลาที่กรอกมาใน times
      for (let i = 0; i < timeSlots.length; i++) {
        const existingTime = timeSlots[i];

        for (let j = i + 1; j < timeSlots.length; j++) {
          const compareTime = timeSlots[j];

          // แปลงเป็นเวลาในรูปแบบที่สามารถเปรียบเทียบได้
          const existingStart = new Date(existingTime.start).getTime();
          const existingEnd = new Date(existingTime.end).getTime();
          const compareStart = new Date(compareTime.start).getTime();
          const compareEnd = new Date(compareTime.end).getTime();

          // ตรวจสอบการทับซ้อนของเวลา
          if (existingStart < compareEnd && existingEnd > compareStart) {
            return res.error(
              400,
              `เวลาการเรียนซ้ำกันในวันที่ ${new Date(
                item.date
              ).toLocaleDateString()}`
            );
          }
        }
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
