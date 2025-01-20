import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  UserLogSchema,
  encryptData,
  decryptData,
  JWT_SECRET,
} from "../../utils/constants";

const User = UserSchema;
const UserLog = UserLogSchema;

export const deleteUser = async (req: Request, res: Response) => {
  const { userID } = req.body;
  const authHeader = req.cookies?.token;

  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    if (!["admin", "super_admin"].includes(decodedToken.role)) {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการลบบัญชีผู้ใช้",
      });
    }

    if (!userID) {
      return res.status(400).json({
        status: "คำขอไม่ถูกต้อง",
        message: "กรุณาระบุ userID",
      });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        status: "ไม่พบข้อมูล",
        message: "ไม่พบผู้ใช้",
      });
    }

    if (user.status === "deleted") {
      return res.status(400).json({
        status: "คำขอไม่ถูกต้อง",
        message: "บัญชีผู้ใช้นี้ถูกลบไปแล้ว",
      });
    }

    // อัปเดตสถานะเป็น "deleted"
    user.status = "deleted";
    await user.save();

    // บันทึก Log การลบบัญชีผู้ใช้
    await UserLog.create({
      action: "delete",
      userId: user._id,
      performedBy: {
        userId: decodedToken.id,
        name: decodedToken.fullName,
      },
      changes: {
        status: "deleted",
      },
    });

    // ส่ง response กลับไปยัง client
    return res.status(200).json({
      status: "สำเร็จ",
      message: "ลบบัญชีผู้ใช้สำเร็จ",
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้",
      error: err.message,
    });
  }
};
