import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  decryptData,
  JWT_SECRET,
} from "../../utils/constants";
import RegistrationSchema from "../../models/registrationSchema";
const Registration = RegistrationSchema;
export const getRegisteredCourses = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      status: "Error",
      message: "ไม่พบ userId ในคำขอ",
    });
  }

  try {
    // ค้นหาการลงทะเบียนของผู้ใช้
    const registrations = await Registration.find({ userId }).populate(
      "courseId"
    ); // populate courseId

    if (registrations.length === 0) {
      return res.status(404).json({
        status: "Not Found",
        message: "ไม่พบข้อมูลการลงทะเบียน",
      });
    }

    const courses = registrations.map((registration) => registration.courseId);

    return res.status(200).json({
      status: "Success",
      message: "ดึงข้อมูลหลักสูตรที่ลงทะเบียนสำเร็จ",
      data: courses,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching registered courses:", error);
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลหลักสูตร",
      error: err.message,
    });
  }
};
