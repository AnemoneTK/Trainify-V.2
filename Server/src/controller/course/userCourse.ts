import {
  Request,
  Response,
  CourseSchema,
  UserSchema,
} from "../../utils/constants"; // Replace with your actual models
import { isValidObjectId } from "mongoose"; // For checking ObjectId validity
import registrationSchema from "../../models/registrationSchema";
import dayjs from "dayjs";

const Registration = registrationSchema;
const Course = CourseSchema;
const User = UserSchema;

import { CourseDocument } from "../../models/courseSchema";

export const getUserRegistrations = async (req: Request, res: Response) => {
  try {
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }

    const { role } = sessionData;
    let userId = sessionData.id; // Default to session user if role is 'employee'

    // If the role is 'admin', check if the user provided userID in the body
    if (role === "admin") {
      const { userID } = req.body;
      if (!userID || !isValidObjectId(userID)) {
        return res.error(400, "กรุณาระบุ userID ที่ถูกต้อง");
      }
      userId = userID;
    }

    // Query the registrations collection for the given userId
    const registrations = await Registration.find({ userId })
      .populate({
        path: "courseId",
        select: "title description place duration schedule banner instructors",
      })
      .populate({
        path: "userId",
        select: "firstName lastName email",
      });

    // If no registrations found
    if (!registrations.length) {
      return res.success("ไม่พบข้อมูลการลงทะเบียน");
    }

    // นับจำนวนคอร์สตามสถานะต่างๆ
    const registeredCourses = registrations.filter(
      (registration) => registration.status === "registered"
    ).length;

    const passedCourses = registrations.filter(
      (registration) => registration.status === "passed"
    ).length;

    const expiredCourses = registrations.filter(
      (registration) => registration.status === "expire"
    ).length;

    // Prepare the response data
    const courses = registrations.map((registration) => {
      const course = registration.courseId as CourseDocument;

      return {
        courseId: course._id,
        courseTitle: course.title,
        courseDescription: course.description,
        coursePlace: course.place?.description,
        courseBanner: course.banner,
        instructors: course.instructors,
        registrationDate: registration.date,
        status: registration.status,
        timeSlot: registration.timeSlot,
      };
    });

    // ส่งจำนวนคอร์สที่ลงทะเบียน, คอร์สที่ผ่านการอบรมแล้ว, และคอร์สที่หมดอายุ
    return res.success("ดึงข้อมูลการลงทะเบียนสำเร็จ", {
      courses,
      registeredCourses,
      passedCourses,
      expiredCourses,
    });
  } catch (error) {
    console.error("Error fetching user registrations:", error);
    return res.error(500, "เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน");
  }
};
