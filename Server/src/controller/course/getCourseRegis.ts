import {
  Request,
  Response,
  CourseSchema,
  decryptData,
} from "../../utils/constants";
import registrationSchema from "../../models/registrationSchema";

const Course = CourseSchema;
const Registration = registrationSchema;

export const getCourseRegistrations = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.error(400, "กรุณาระบุ courseId");
    }

    // ค้นหาหลักสูตรจาก courseId
    const course = await Course.findById(courseId);
    if (!course) {
      return res.error(404, "ไม่พบหลักสูตร");
    }

    // ค้นหาการลงทะเบียนทั้งหมดสำหรับหลักสูตรนี้
    const registrations = await Registration.find({ courseId })
      .populate("userId", "titleName firstName lastName email")
      .lean()
      .sort({ date: 1, "timeSlot.start": 1 });

    if (!registrations || registrations.length === 0) {
      return res.error(404, "ไม่มีผู้ลงทะเบียนในหลักสูตรนี้");
    }

    // จัดกลุ่มการลงทะเบียนตามวันที่ และรวมข้อมูลผู้ใช้ในแต่ละช่วงเวลา
    const groupedByDate: Record<string, any[]> = registrations.reduce(
      (acc, registration) => {
        const dateKey = new Date(registration.date).toLocaleDateString();
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        // ตรวจสอบว่ามีข้อมูลของ userId หรือไม่
        if (!registration.userId) {
          // ถ้าไม่มีข้อมูลผู้ใช้ ให้ข้ามการประมวลผล registration นี้
          return acc;
        }

        const user = registration.userId as any;
        const decryptedUser = {
          titleName: (user.titleName as String) || "",
          firstName: decryptData(user.firstName),
          lastName: decryptData(user.lastName),
          email: decryptData(user.email),
          _id: user._id,
          status: registration.status,
        };

        const timeSlotKey = `${new Date(
          registration.timeSlot.start
        ).toISOString()}_${new Date(registration.timeSlot.end).toISOString()}`;

        // ตรวจสอบว่ามี entry สำหรับ timeSlot นี้อยู่แล้วหรือไม่
        let timeSlotGroup = acc[dateKey].find(
          (entry) => entry.timeSlotKey === timeSlotKey
        );

        if (timeSlotGroup) {
          // ถ้ามีอยู่แล้ว ให้ push ข้อมูลผู้ใช้เข้าไปใน array
          timeSlotGroup.users.push(decryptedUser);
        } else {
          // ถ้ายังไม่มี ให้สร้าง entry ใหม่
          acc[dateKey].push({
            timeSlot: registration.timeSlot,
            timeSlotKey,
            users: [decryptedUser],
            courseTitle: course.title,
            status: course.status,
            // คุณอาจเพิ่ม field อื่น ๆ ที่ต้องการได้ที่นี่
          });
        }
        return acc;
      },
      {} as Record<string, any[]>
    );

    return res.success("ดึงข้อมูลการลงทะเบียนสำเร็จ", {
      count: registrations.length,
      data: groupedByDate,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching course registrations:", err.message);
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการดึงข้อมูลการลงทะเบียน",
      err.message
    );
  }
};
