import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  UserLogSchema,
  JWT_SECRET,
  encryptData,
} from "../../utils/constants";
import { Types } from "mongoose";

const User = UserSchema;
const UserLog = UserLogSchema;

interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  department: Types.ObjectId;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const editUser = async (req: Request, res: Response) => {
  const { userId, firstName, lastName, phoneNumber, department } = req.body; // ข้อมูลที่จะแก้ไข

  const authHeader = req.cookies?.token;
  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    const currentUserId = decodedToken.id;
    const currentUserRole = decodedToken.role;

    if (!userId) {
      return res.status(400).json({
        status: "Error",
        message: "กรุณาระบุ userId ที่ต้องการแก้ไข",
      });
    }

    // ตรวจสอบสิทธิ์
    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({
        status: "Error",
        message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข",
      });
    }

    if (
      (currentUserRole === "admin" && userToUpdate.role !== "employee") ||
      (currentUserRole !== "super_admin" && currentUserRole !== "admin")
    ) {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ใช้นี้",
      });
    }

    // เตรียมข้อมูลที่จะอัปเดต (ไม่ใช้ UserDocument)
    const updatedData: Partial<UserDocument> = {}; // ใช้ Partial<UserDocument>
    if (firstName) updatedData.firstName = encryptData(firstName);
    if (lastName) updatedData.lastName = encryptData(lastName);
    if (phoneNumber) updatedData.phoneNumber = encryptData(phoneNumber);
    if (department) updatedData.department = department;

    // อัปเดตข้อมูลผู้ใช้
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "Error",
        message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข",
      });
    }

    // บันทึกประวัติการแก้ไข
    const log = new UserLog({
      action: "update",
      userId: updatedUser._id,
      performedBy: {
        userId: currentUserId,
        name: decodedToken.fullName,
      },
      changes: updatedData,
      timestamp: new Date(),
    });
    await log.save();

    return res.status(200).json({
      status: "Success",
      message: "แก้ไขข้อมูลผู้ใช้สำเร็จ",
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error during edit user:", error);
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้",
      error: err.message,
    });
  }
};
