import { Request, Response, courseSchema } from "../../utils/constants";

const Course = courseSchema;

export const editCourse = async (req: Request, res: Response) => {
  const { courseID, updateData } = req.body;

  // ตรวจสอบ courseID และ updateData ถูกส่งมา
  if (!courseID || !updateData || typeof updateData !== "object") {
    return res.status(400).json({
      status: "คำขอไม่ถูกต้อง",
      message: "กรุณาระบุ courseID และข้อมูลการแก้ไขที่ถูกต้อง",
    });
  }

  try {
    // ค้นหาหลักสูตรตาม courseID
    const course = await Course.findById(courseID);
    if (!course) {
      return res.status(404).json({
        status: "ไม่พบข้อมูล",
        message: "ไม่พบหลักสูตรที่ระบุ",
      });
    }

    // อัปเดตฟิลด์ที่อนุญาตให้แก้ไขเท่านั้น
    const allowedFields = [
      "title",
      "description",
      "date",
      "dueDate",
      "place",
      "period",
      "Instructor",
      "type",
      "tag",
      "banner",
      "status",
    ];
    allowedFields.forEach((key) => {
      if (key in updateData) {
        course.set(key, updateData[key]);
      }
    });

    // บันทึกการเปลี่ยนแปลงในฐานข้อมูล
    await course.save();

    res.status(200).json({
      status: "สำเร็จ",
      message: "แก้ไขหลักสูตรสำเร็จ",
      course,
    });
  } catch (error) {
    console.error("Error editing course:", error);
    const err = error as Error; // ใช้ Type assertion เพื่อแปลง error เป็น Error
    res.status(500).json({
      status: "ข้อผิดพลาด",
      message: "ไม่สามารถแก้ไขหลักสูตรได้",
      error: err.message,
    });
  }
};
