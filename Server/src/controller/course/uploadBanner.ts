import { Request, Response } from "express";
import upload from "../../middlewares/upload"; // Import multer configuration

export const uploadBanner = [
  upload.single("banner"), // ใช้ Multer Middleware สำหรับรับไฟล์ที่ชื่อ "banner"
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: "Error",
          message: "กรุณาอัปโหลดไฟล์",
        });
      }

      // สร้าง URL หรือ path ของไฟล์
      const bannerUrl = `/uploads/banners/${req.file.filename}`;
      return res.status(200).json({
        status: "Success",
        message: "อัปโหลดไฟล์สำเร็จ",
        bannerUrl,
      });
    } catch (error) {
      const err = error as Error;
      return res.status(500).json({
        status: "Error",
        message: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์",
        error: err.message,
      });
    }
  },
];
