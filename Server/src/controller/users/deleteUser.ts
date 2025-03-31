import {
  Request,
  Response,
  UserSchema,
  UserLogSchema,
} from "../../utils/constants";

const User = UserSchema;
const UserLog = UserLogSchema;

export const deleteUser = async (req: Request, res: Response) => {
  const { userID } = req.body;

  // ตรวจสอบข้อมูลผู้ใช้ใน session
  const sessionData = (req.session as any)?.userData;
  if (!sessionData) {
    return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  // ตรวจสอบสิทธิ์ของผู้ใช้จาก session (admin และ super_admin)
  if (!["admin", "super_admin"].includes(sessionData.role)) {
    return res.error(403, "คุณไม่มีสิทธิ์ในการลบบัญชีผู้ใช้");
  }

  if (!userID) {
    return res.error(400, "กรุณาระบุ userID");
  }

  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.error(404, "ไม่พบผู้ใช้");
    }

    // หาก sessionData.role เป็น "admin" ให้ตรวจสอบว่าผู้ใช้ที่จะลบมี role เป็น "employee" หรือไม่
    if (sessionData.role === "admin" && user.role !== "employee") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการลบบัญชีผู้ใช้");
    }

    if (user.status === "deleted") {
      return res.error(400, "บัญชีผู้ใช้นี้ถูกลบไปแล้ว");
    }

    // อัปเดตสถานะเป็น "deleted"
    user.status = "deleted";
    await user.save();

    // บันทึก Log การลบบัญชีผู้ใช้
    await UserLog.create({
      action: "delete",
      userId: user._id,
      performedBy: {
        userId: sessionData.id,
        name: sessionData.fullName,
      },
      changes: {
        status: "deleted",
      },
    });

    return res.success("ลบบัญชีผู้ใช้สำเร็จ");
  } catch (error) {
    const err = error as Error;
    console.error("Error deleting user:", err.message);
    return res.error(500, "เกิดข้อผิดพลาดในการลบบัญชีผู้ใช้", err.message);
  }
};
