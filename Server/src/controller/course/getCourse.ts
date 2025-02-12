import { Request, Response, CourseSchema } from "../../utils/constants";
const Course = CourseSchema;

export const getCourse = async (req: Request, res: Response) => {
  try {
    // ใช้ session แทน JWT
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }

    // ✅ กำหนดค่าเริ่มต้นให้พารามิเตอร์
    const {
      courseID = null,
      type = null,
      status = null,
      startTimes = null,
      endTimes = null,
    } = req.body || {}; // ป้องกันกรณี req.body เป็น undefined

    // ✅ ปรับ `filter` ให้รองรับทุกกรณี
    const filter: any = {};

    if (courseID) {
      filter._id = courseID;
    }
    if (type) {
      filter.type = type;
    }

    // ✅ ตรวจสอบสิทธิ์ก่อนตั้งค่า filter สถานะ
    if (status) {
      if (sessionData.role === "admin") {
        filter.status = status;
      } else {
        filter.status = "public"; // พนักงานเห็นเฉพาะ public
      }
    }

    // ✅ ถ้าไม่ส่ง status มาเลย (รวมทุกสถานะ)
    if (!status && sessionData.role === "admin") {
      delete filter.status;
    }

    // ✅ ตรวจสอบช่วงเวลา
    if (startTimes || endTimes) {
      filter["schedule.date"] = {};
      if (startTimes) filter["schedule.date"].$gte = new Date(startTimes);
      if (endTimes) filter["schedule.date"].$lte = new Date(endTimes);

      // ✅ ลบ filter ถ้าไม่มีการกำหนดช่วงเวลา
      if (Object.keys(filter["schedule.date"]).length === 0) {
        delete filter["schedule.date"];
      }
    }

    // ✅ ค้นหาคอร์สตาม filter (หรือทั้งหมดถ้าไม่มีเงื่อนไข)
    const courses = await Course.find(filter);

    return res.success("ดึงข้อมูลคอร์สสำเร็จ", {
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส",
      (error as Error).message
    );
  }
};
