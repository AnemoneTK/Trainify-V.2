import { Request, Response, CourseSchema } from "../../utils/constants";

const Course = CourseSchema;

export const editCourse = async (req: Request, res: Response) => {
  const { courseID, updateData } = req.body;

  // ตรวจสอบว่า updateData ถูกส่งมาหรือไม่
  if (!courseID || !updateData || typeof updateData !== "object") {
    return res.status(400).json({
      status: "คำขอไม่ถูกต้อง",
      message: "กรุณาระบุ courseID และข้อมูลการแก้ไขที่ถูกต้อง",
    });
  }

  // ตรวจสอบว่า updateData มีฟิลด์ dueDate หรือไม่
  const { dueDate, schedule, type, place, status } = updateData;

  // หาก dueDate หรือฟิลด์อื่น ๆ เป็น undefined ให้ส่งคำขอผิดพลาด
  if (!dueDate) {
    return res.status(400).json({
      status: "คำขอไม่ถูกต้อง",
      message: "กรุณาระบุวันเปิดและวันปิดรับสมัคร",
    });
  }

  const now = new Date();

  // ตรวจสอบสิทธิ์ผู้ใช้จาก session
  const sessionData = (req.session as any)?.userData;
  if (!sessionData) {
    return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  // ตรวจสอบสิทธิ์เฉพาะ Admin เท่านั้น
  if (sessionData.role !== "admin") {
    return res.error(403, "คุณไม่มีสิทธิ์ในการแก้ไขหลักสูตร");
  }

  try {
    // ค้นหาหลักสูตรตาม courseID
    const course = await Course.findById(courseID);
    if (!course) {
      return res.status(404).json({
        status: "ไม่พบข้อมูล",
        message: "ไม่พบหลักสูตรที่ระบุ",
      });
    }

    // ตรวจสอบสถานะของหลักสูตรก่อนทำการแก้ไข
    const invalidStatuses = ["deleted", "close", "end"];
    if (invalidStatuses.includes(course.status)) {
      return res.error(
        400,
        `ไม่สามารถแก้ไขหลักสูตรในสถานะ '${course.status}' ได้`
      );
    }

    // ตรวจสอบวันปิดรับสมัครต้องเป็นอนาคต
    const dueDateEnd = new Date(dueDate.end);
    if (dueDateEnd < now) {
      return res.error(400, "วันที่ปิดรับสมัครต้องไม่ใช่วันที่ผ่านมาแล้ว");
    }

    // ตรวจสอบว่าวันเริ่มเรียนต้องอยู่หลังจากวันปิดรับสมัคร
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

    // อัปเดตข้อมูลทั้งหมดตามที่ได้รับใน updateData
    await Course.findByIdAndUpdate(courseID, updateData, { new: true });

    // ค้นหาหลักสูตรที่อัปเดตแล้ว
    const updatedCourse = await Course.findById(courseID);

    res.status(200).json({
      status: "สำเร็จ",
      message: "แก้ไขหลักสูตรสำเร็จ",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error editing course:", error);
    const err = error as Error; // ใช้ Type assertion เพื่อแปลง error เป็น Error
    res.status(500).json({
      status: "ข้อผิดพลาด",
      message: "ไม่สามารถแก้ไขหลักสูตรได้",
      error: err.message,
    });
  }
};
