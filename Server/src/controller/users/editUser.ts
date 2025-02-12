import { Request, Response } from "express";
import userLogSchema from "../../models/userLogSchema";
import userSchema from "../../models/userSchema";
import { encryptData } from "../../utils/constants";
import { Types } from "mongoose";

const User = userSchema;
const UserLog = userLogSchema;

interface UserDocument {
  titleName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  department?: Types.ObjectId;
  role?: string;
  status?: string;
}

export const editUser = async (req: Request, res: Response) => {
  const {
    userId,
    titleName,
    firstName,
    lastName,
    phoneNumber,
    departmentID,
    role,
    status,
  } = req.body;

  const sessionData = req.session as any;
  if (!sessionData || !sessionData.userData) {
    return res.error(401, "ไม่พบข้อมูลผู้ใช้", "กรุณาเข้าสู่ระบบใหม่");
  }

  const {
    id: currentUserId,
    role: currentUserRole,
    fullName,
  } = sessionData.userData;

  if (!userId) {
    return res.error(400, "คำขอไม่ถูกต้อง", "กรุณาระบุ userId ที่ต้องการแก้ไข");
  }

  try {
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.error(404, "ไม่พบข้อมูล", "ไม่พบผู้ใช้ที่ต้องการแก้ไข");
    }

    if (currentUserRole === "admin" && userToUpdate.role !== "employee") {
      return res.error(403, "ไม่มีสิทธิ์", "คุณไม่มีสิทธิ์ในการแก้ไขบัญชีนี้");
    }

    if (currentUserRole === "admin" && role === "super_admin") {
      return res.error(
        403,
        "ไม่มีสิทธิ์",
        "คุณไม่สามารถเปลี่ยนบัญชีให้เป็น super_admin ได้"
      );
    }

    // เตรียมข้อมูลที่จะอัปเดต
    const updatedData: Partial<UserDocument> = {};
    if (titleName) updatedData.titleName = titleName;
    if (firstName) updatedData.firstName = encryptData(firstName);
    if (lastName) updatedData.lastName = encryptData(lastName);
    if (phoneNumber) updatedData.phoneNumber = encryptData(phoneNumber);
    if (departmentID) updatedData.department = departmentID;
    if (status) updatedData.status = status;

    if (role && currentUserRole === "super_admin") {
      updatedData.role = role;
    }

    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.error(404, "ไม่พบข้อมูล", "ไม่พบผู้ใช้ที่ต้องการแก้ไข");
    }

    // บันทึกประวัติการแก้ไข
    await UserLog.create({
      action: "update",
      userId: updatedUser._id,
      performedBy: {
        userId: currentUserId,
        name: fullName,
      },
      changes: updatedData,
      timestamp: new Date(),
    });

    return res.success("แก้ไขข้อมูลผู้ใช้สำเร็จ", updatedUser);
  } catch (error) {
    const err = error as Error;
    console.error("Error during edit user:", err);
    return res.error(500, "เกิดข้อผิดพลาด", err.message);
  }
};
