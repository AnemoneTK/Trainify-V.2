import {
  Request,
  Response,
  jwt,
  JwtPayload,
  CourseSchema,
  JWT_SECRET,
} from "../../utils/constants";
import registrationSchema from "../../models/registrationSchema";
const Registration = registrationSchema;
const Course = CourseSchema;

export const checkAndUpdateCourseStatus = async () => {
  try {
    const currentDate = new Date();

    // ค้นหาคอร์สที่ยังไม่ได้ปิด (สถานะไม่ใช่ "close" หรือ "deleted" หรือ "end")
    const courses = await Course.find({
      status: { $nin: ["close", "deleted", "end"] },
    });

    for (const course of courses) {
      if (!course.schedule || course.schedule.length === 0) {
        continue;
      }

      // เรียงลำดับตารางการอบรมตามวันที่ เพื่อหาวันสุดท้ายของการอบรม
      const sortedSchedules = [...course.schedule].sort((a, b) => {
        const dateA = a.date instanceof Date ? a.date : new Date(a.date);
        const dateB = b.date instanceof Date ? b.date : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

      // หาวันที่อบรมวันสุดท้าย
      const lastScheduleDay = sortedSchedules[sortedSchedules.length - 1];

      if (
        !lastScheduleDay ||
        !lastScheduleDay.times ||
        lastScheduleDay.times.length === 0
      ) {
        continue;
      }

      // เรียงลำดับช่วงเวลาในวันสุดท้าย เพื่อหาเวลาสิ้นสุดการอบรมสุดท้าย
      const sortedTimes = [...lastScheduleDay.times].sort((a, b) => {
        // ตรวจสอบรูปแบบวันที่ (อาจเป็น Date object หรือ ISODate จาก MongoDB)
        const endA = a.end instanceof Date ? a.end : new Date(a.end);
        const endB = b.end instanceof Date ? b.end : new Date(b.end);
        return endA.getTime() - endB.getTime();
      });

      const lastTimeSlot = sortedTimes[sortedTimes.length - 1];
      if (!lastTimeSlot || !lastTimeSlot.end) {
        continue;
      }

      const lastEndTime =
        lastTimeSlot.end instanceof Date
          ? lastTimeSlot.end
          : new Date(lastTimeSlot.end);

      const lastScheduleDate =
        lastScheduleDay.date instanceof Date
          ? lastScheduleDay.date
          : new Date(lastScheduleDay.date);

      const lastScheduleDateTime = new Date(lastScheduleDate);
      const endTimeDate = new Date(lastEndTime);

      lastScheduleDateTime.setHours(
        endTimeDate.getHours(),
        endTimeDate.getMinutes(),
        endTimeDate.getSeconds()
      );

      if (lastScheduleDateTime < currentDate) {
        await Course.findByIdAndUpdate(course._id, { status: "end" });
        console.log(
          `คอร์ส "${course.title}" (ID: ${course._id}) ถูกอัปเดตสถานะเป็น "end" เนื่องจากจบการอบรมแล้ว`
        );
        console.log(
          `วันที่สิ้นสุดการอบรม: ${lastScheduleDateTime.toISOString()}, วันที่ปัจจุบัน: ${currentDate.toISOString()}`
        );

        // เมื่อคอร์สมีสถานะเป็น "end", เปลี่ยนสถานะการลงทะเบียนที่เกี่ยวข้องให้เป็น "wait"
        const registrations = await Registration.find({
          courseId: course._id,
          status: { $ne: "passed" }, // ไม่รวมสถานะที่ผ่านแล้ว
        });

        // อัปเดตสถานะของการลงทะเบียนทั้งหมดเป็น "wait"
        for (const registration of registrations) {
          await Registration.findByIdAndUpdate(registration._id, {
            status: "wait",
          });
          console.log(
            `การลงทะเบียน (ID: ${registration._id}) สำหรับคอร์ส "${course.title}" ถูกเปลี่ยนสถานะเป็น "wait"`
          );
        }
      }
    }

    console.log("การตรวจสอบและอัปเดตสถานะคอร์สเสร็จสิ้น");
  } catch (error) {
    const err = error as Error;
    console.error(
      "เกิดข้อผิดพลาดในการตรวจสอบและอัปเดตสถานะคอร์ส:",
      err.message
    );
    throw error;
  }
};
