import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  CourseSchema,
  decryptData,
  JWT_SECRET,
} from "../../utils/constants";
import upload from "../../middlewares/upload"; // import multer middleware

const Course = CourseSchema;

export const getCourse = async (req: Request, res: Response) => {
  const { courseID, type, status, startTimes, endTimes } = req.body;
  const authHeader = req.cookies.token;

  // ตรวจสอบ token ใน cookies
  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    if (!decodedToken) {
      return res.status(403).json({
        status: "No User",
        message: "ไม่พบผู้ใช้งาน",
      });
    }

    // สร้างตัวกรองสำหรับ query
    const filter: any = {};

    // เพิ่มเงื่อนไขการกรองตามข้อมูลที่ได้รับ
    if (courseID !== 0) {
      filter._id = courseID;
    }
    if (type !== "") {
      filter.type = type;
    }
    if (status !== "" && decodedToken.role !== "employee") {
      filter.status = status;
    } else {
      filter.status = "public";
    }

    if (startTimes !== "" || endTimes !== "") {
      filter["schedule.times.start"] = startTimes
        ? { $gte: new Date(startTimes) }
        : undefined;
      filter["schedule.times.end"] = endTimes
        ? { $lte: new Date(endTimes) }
        : undefined;
    }

    // ลบเงื่อนไขที่เป็น undefined ออกจาก filter
    Object.keys(filter).forEach((key) => {
      if (filter[key] === undefined) {
        delete filter[key];
      }
    });

    // ค้นหาคอร์สตาม filter
    const course = await Course.find(filter);

    res.status(200).json({
      status: "ok",
      count: course.length,
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลคอร์ส",
      error: (error as Error).message,
    });
  }
};
