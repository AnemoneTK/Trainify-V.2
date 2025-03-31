import { Request, Response, CourseSchema } from "../../utils/constants";

import RegistrationSchema from "../../models/registrationSchema";
const Registration = RegistrationSchema;
const Course = CourseSchema;

export const getAvailableCourses = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();

    // ค้นหาหลักสูตรที่เปิดรับลงทะเบียนและมีวันที่ปิดรับในอนาคต
    const courses = await Course.find({
      status: { $in: ["open", "public"] }, // ตรวจสอบสถานะเป็น open หรือ public
      "dueDate.start": { $lte: currentDate }, // วันเปิดรับลงทะเบียนต้องเป็นอดีต
      "dueDate.end": { $gte: currentDate }, // วันปิดรับต้องเป็นในอนาคต
    });

    // ค้นหาหลักสูตรที่มีที่นั่งว่าง
    const availableCourses = [];

    for (const course of courses) {
      for (const schedule of course.schedule) {
        // ตรวจสอบวันที่ของคอร์ส (ไม่ใช่วันในอดีต)
        const courseDate = new Date(schedule.date);
        if (courseDate < currentDate) {
          continue; // ข้ามคอร์สที่มีวันที่ในอดีต
        }

        for (const time of schedule.times) {
          const currentRegistrations = await Registration.countDocuments({
            courseId: course._id,
            date: schedule.date,
            "timeSlot.start": time.start,
            "timeSlot.end": time.end,
          });

          if (currentRegistrations < time.seat) {
            availableCourses.push({
              courseId: course._id,
              title: course.title,
              description: course.description,
              scheduleDate: courseDate.toLocaleDateString(),
              startTime: new Date(time.start).toLocaleTimeString(),
              endTime: new Date(time.end).toLocaleTimeString(),
              seatsAvailable: time.seat - currentRegistrations,
              place: course.place,
            });
          }
        }
      }
    }

    return res.status(200).json({
      status: "Success",
      message: "ดึงข้อมูลหลักสูตรที่สามารถลงทะเบียนได้",
      data: availableCourses,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching available courses:", error);
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร",
      error: err.message,
    });
  }
};
