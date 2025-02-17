import { Request, Response, CourseSchema } from "../../utils/constants";
const Course = CourseSchema;

export const getCourse = async (req: Request, res: Response) => {
  try {
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }

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

    if (status) {
      if (sessionData.role === "admin") {
        filter.status = status;
      } else {
        filter.status = "public"; // พนักงานเห็นเฉพาะ public
      }
    }

    if (!status && sessionData.role === "admin") {
      delete filter.status;
    }

    if (startTimes || endTimes) {
      filter["schedule.date"] = {};
      if (startTimes) filter["schedule.date"].$gte = new Date(startTimes);
      if (endTimes) filter["schedule.date"].$lte = new Date(endTimes);

      if (Object.keys(filter["schedule.date"]).length === 0) {
        delete filter["schedule.date"];
      }
    }

    filter.status = { $ne: "deleted" };

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
