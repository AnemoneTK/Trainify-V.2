import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  UserLogSchema,
  CourseSchema,
  encryptData,
  JWT_SECRET,
  bcrypt,
} from "../../utils/constants";
const Course = CourseSchema;
export const deleteCourse = async (req: Request, res: Response) => {
  const { courseID } = req.body;
  const authHeader = req.cookies?.token;
  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    if (!["admin", "super_admin"].includes(decodedToken.role)) {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการลบหลักสูตร",
      });
    }
    if (!courseID) {
      return res.status(400).json({
        status: "คำขอไม่ถูกต้อง",
        message: "กรุณาระบุ courseID",
      });
    }

    const course = await Course.findById(courseID);
    if (!course) {
      return res.status(404).json({
        status: "ไม่พบข้อมูล",
        message: "ไม่พบหลักสูตร",
      });
    }

    if (course.status === "deleted") {
      return res.status(400).json({
        status: "คำขอไม่ถูกต้อง",
        message: "หลักสูตรนี้ถูกลบไปแล้ว",
      });
    }

    course.status = "deleted";
    await course.save();

    res.status(200).json({
      status: "สำเร็จ",
      message: "ลบหลักสูตรสำเร็จ",
    });
  } catch (error) {
    const err = error as Error;
    return res.status(400).json({
      status: "Error",
      message: "ลบหลักสูตรไม่สำเร็จ",
      error: err.message,
    });
  }
};
