import { Request, Response } from "express";
import Tag from "../../models/tagSchema";

// สร้าง Tag ใหม่
export const createTag = async (req: Request, res: Response) => {
  try {
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }
    // ตรวจสอบสิทธิ์เฉพาะ Admin เท่านั้น
    if (sessionData.role !== "admin") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการสร้างแท๊กหลักสูตร");
    }

    const { name } = req.body;
    if (!name) {
      return res.error(400, "กรุณาระบุชื่อ tag");
    }

    // ตรวจสอบชื่อซ้ำ (case insensitive)
    const existingTag = await Tag.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });
    if (existingTag) {
      return res.error(400, "มี tag นี้อยู่แล้ว กรุณาระบุชื่ออื่น");
    }

    const newTag = new Tag({ name });
    await newTag.save();

    return res.success("สร้าง tag สำเร็จ", {
      id: newTag._id,
      name: newTag.name,
    });
  } catch (error) {
    console.error("Error in createTag:", error);
    return res.error(500, "เกิดข้อผิดพลาดในการสร้าง tag", error);
  }
};

// ดึงข้อมูล tag ทั้งหมด (เอาแค่ _id และ name)
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find({}, { name: 1 });
    return res.success("ดึงข้อมูล tag สำเร็จ", tags);
  } catch (error) {
    console.error("Error in getTags:", error);
    return res.error(500, "เกิดข้อผิดพลาดในการดึงข้อมูล tag", error);
  }
};

// แก้ไข tag (อัพเดทชื่อ tag)
export const updateTag = async (req: Request, res: Response) => {
  try {
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }
    // ตรวจสอบสิทธิ์เฉพาะ Admin เท่านั้น
    if (sessionData.role !== "admin") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการแก้ไขแท๊กหลักสูตร");
    }

    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.error(400, "กรุณาระบุชื่อ tag ที่ต้องการอัพเดท");
    }

    // ตรวจสอบชื่อซ้ำ (ต้องไม่ใช่ tag ตัวเอง)
    const duplicateTag = await Tag.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
      _id: { $ne: id },
    });
    if (duplicateTag) {
      return res.error(400, "มี tag นี้อยู่แล้ว กรุณาระบุชื่ออื่น");
    }

    const updatedTag = await Tag.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedTag) {
      return res.error(404, "ไม่พบ tag ที่ต้องการอัพเดท");
    }

    return res.success("อัพเดท tag สำเร็จ", {
      id: updatedTag._id,
      name: updatedTag.name,
    });
  } catch (error) {
    console.error("Error in updateTag:", error);
    return res.error(500, "เกิดข้อผิดพลาดในการอัพเดท tag", error);
  }
};

// ลบ tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const sessionData = (req.session as any)?.userData;
    if (!sessionData) {
      return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
    }
    // ตรวจสอบสิทธิ์เฉพาะ Admin เท่านั้น
    if (sessionData.role !== "admin") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการลบแท๊กหลักสูตร");
    }

    const { id } = req.params;
    const deletedTag = await Tag.findByIdAndDelete(id);
    if (!deletedTag) {
      return res.error(404, "ไม่พบ tag ที่ต้องการลบ");
    }
    return res.success("ลบ tag สำเร็จ", {
      id: deletedTag._id,
      name: deletedTag.name,
    });
  } catch (error) {
    console.error("Error in deleteTag:", error);
    return res.error(500, "เกิดข้อผิดพลาดในการลบ tag", error);
  }
};
