import { Request, Response } from "express";
import upload from "../../middlewares/upload"; // Import multer configuration

export const uploadBanner = [
  upload.single("banner"),
  async (req: Request, res: Response) => {
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
  },
];
