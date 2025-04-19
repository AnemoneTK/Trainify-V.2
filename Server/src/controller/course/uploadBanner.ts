import { Request, Response, NextFunction } from "express";
import upload from "../../middlewares/upload"; // Import multer configuration
import fs from "fs";
import path from "path";
import { CourseSchema } from "../../utils/constants";
const Course = CourseSchema;

// แก้ไขเป็นฟังก์ชันเดียวที่จัดการทั้ง middleware และ logic
export const uploadBanner = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // เรียกใช้ middleware upload ก่อน
  upload.single("banner")(req, res, async (err) => {
    if (err) {
      return res.error(500, "เกิดข้อผิดพลาดในการอัปโหลดไฟล์", err.message);
    }

    try {
      // ตรวจสอบ session
      const sessionData = (req.session as any)?.userData;
      if (!sessionData) {
        return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
      }

      // ตรวจสอบสิทธิ์ admin
      if (sessionData.role !== "admin") {
        return res.error(403, "คุณไม่มีสิทธิ์อัปโหลดแบนเนอร์");
      }

      if (!req.file) {
        return res.error(400, "กรุณาอัปโหลดไฟล์");
      }

      // สร้าง URL หรือ path ของไฟล์
      const bannerUrl = `/uploads/banners/${req.file.filename}`;

      return res.success("อัปโหลดไฟล์สำเร็จ", { bannerUrl });
    } catch (error) {
      return res.error(
        500,
        "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
        (error as Error).message
      );
    }
  });
};

// ส่วน deleteBanner ยังคงเหมือนเดิม ไม่ต้องแก้ไข
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    // ตรวจสอบ session
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }

    // ตรวจสอบสิทธิ์เฉพาะ Admin เท่านั้น
    if (sessionData.role !== "admin") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการลบแบนเนอร์");
    }

    // ดึง courseID และ bannerUrl จาก request body
    const { courseID } = req.body;
    if (!courseID) {
      return res.error(400, "กรุณาระบุ courseID");
    }

    const course = await Course.findById(courseID);
    if (!course) {
      return res.error(404, "ไม่พบหลักสูตร");
    }

    const bannerUrl = course.banner;
    if (!bannerUrl) {
      return res.error(404, "ไม่พบแบนเนอร์");
    }

    // ลบไฟล์แบนเนอร์จากระบบไฟล์ (เช่น: /uploads/banners)
    const filePath = path.join(__dirname, "../../", bannerUrl);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.error(500, "ไม่สามารถลบไฟล์ได้");
      }
      // อัปเดตค่าในฐานข้อมูลให้เป็นค่าว่าง
      course.banner = "";
      course.save();

      return res.success("ลบแบนเนอร์สำเร็จ");
    });
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการลบแบนเนอร์",
      (error as Error).message
    );
  }
};
