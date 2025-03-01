import { Request, Response, CourseSchema } from "../../utils/constants";
import registrationSchema from "../../models/registrationSchema";
const Course = CourseSchema;
const Registration = registrationSchema;

interface TimeSlot {
  start: Date;
  end: Date;
  seat: number;
  registeredSeats: number;
  availableSeats?: number; // เพิ่ม `availableSeats` ในชนิดข้อมูล
}

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
        filter.status = "public";
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

    const courses = await Course.find(filter).populate("tag");

    // ตรวจสอบจำนวนที่นั่งว่างในแต่ละคอร์ส
    for (const course of courses) {
      let allFull = true;
      for (const schedule of course.schedule) {
        schedule.times = await Promise.all(
          schedule.times.map(async (timeSlot: TimeSlot) => {
            const totalSeats = timeSlot.seat;
            const registeredSeats = await Registration.countDocuments({
              courseId: course._id,
              date: schedule.date,
              "timeSlot.start": timeSlot.start,
              "timeSlot.end": timeSlot.end,
              status: "registered",
            });

            const availableSeats = totalSeats - registeredSeats;
            const updatedTimeSlot = { ...timeSlot, availableSeats };
            if (availableSeats > 0) {
              allFull = false;
            }
            return updatedTimeSlot;
          })
        );
      }
      // เพิ่มสถานะ availabilityStatus ให้กับคอร์ส
      course.availabilityStatus = allFull ? false : true;
    }

    // ถ้าเป็น employee ให้ตรวจสอบสถานะการลงทะเบียน
    if (sessionData.role === "employee") {
      // ดึงการลงทะเบียนของผู้ใช้สำหรับคอร์สนี้
      for (const course of courses) {
        const registration = await Registration.findOne({
          userId: sessionData.id,
          courseId: course._id,
          status: "registered",
        });

        // ถ้ามีการลงทะเบียนให้เพิ่มสถานะการลงทะเบียน
        course.registrationStatus = registration ? true : false;
      }
    }

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
