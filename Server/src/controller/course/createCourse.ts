import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  CourseSchema,
  JWT_SECRET,
} from "../../utils/constants";
const Course = CourseSchema;

export const createCourse = async (req: Request, res: Response) => {
  const authHeader = req.cookies?.token;

  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    // ตรวจสอบ token และดึงข้อมูล
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;

    if (decodedToken.role !== "admin") {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการสร้างหลักสูตร",
      });
    }

    // ใช้ข้อมูลจาก req.body โดยตรง
    const {
      title,
      description,
      schedule,
      dueDate,
      place,
      type,
      instructors,
      tag,
      status,
      banner,
    } = req.body;

    if (new Date(dueDate.end) < new Date()) {
      return res.status(400).json({
        status: "Error",
        message: "วันที่ปิดรับสมัครต้องไม่ใช่วันที่ผ่านมาแล้ว",
      });
    }

    for (const item of schedule) {
      const scheduleDate = new Date(item.date);
      if (scheduleDate < new Date()) {
        return res.status(400).json({
          status: "Error",
          message: `วันที่ใน schedule ต้องไม่ใช่วันในอดีต (${
            scheduleDate.toISOString().split("T")[0]
          })`,
        });
      }

      for (const timeSlot of item.times) {
        const startTime = new Date(timeSlot.start);
        const endTime = new Date(timeSlot.end);
        if (startTime < new Date()) {
          return res.status(400).json({
            status: "Error",
            message: `เวลาของกิจกรรมต้องไม่ใช่เวลาที่ผ่านมา (${
              startTime.toISOString().split("T")[1]
            })`,
          });
        }
        if (endTime < new Date()) {
          return res.status(400).json({
            status: "Error",
            message: `เวลาของกิจกรรมต้องไม่ใช่เวลาที่ผ่านมา (${
              endTime.toISOString().split("T")[1]
            })`,
          });
        }
      }
    }

    // ตรวจสอบความสมบูรณ์ของข้อมูล
    if (
      type === "offline" &&
      (!place || !place.description || place.description.trim() === "")
    ) {
      return res.status(400).json({
        status: "Error",
        message: "กรุณาระบุข้อความบอกสถานที่เมื่อจัดอบรมแบบ Offline",
      });
    }

    // สร้างข้อมูลหลักสูตรใหม่
    const newCourse = new Course({
      title,
      description,
      schedule,
      dueDate,
      place,
      type,
      instructors,
      tag,
      status: status || "active",
      createdBy: {
        userId: decodedToken.id,
        fullName: decodedToken.fullName,
        role: decodedToken.role,
      },
      banner,
    });

    await newCourse.save();

    return res.status(201).json({
      status: "Success",
      message: "สร้างหลักสูตรสำเร็จ",
      course: newCourse,
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการสร้างหลักสูตร",
      error: err.message,
    });
  }
};
