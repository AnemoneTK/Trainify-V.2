import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  decryptData,
  JWT_SECRET,
} from "../../utils/constants";
import LogoutLogSchema from "../../models/logoutLogSchema";

export const auth = async (req: Request, res: Response) => {
  const { role } = req.body;
  const authHeader = req.cookies.token;

  console.log("authHeader", authHeader);

  // ตรวจสอบว่า token มีค่าหรือไม่
  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token ยืนยันตัวตน",
      detail: "กรุณาเข้าสู่ระบบอีกครั้ง",
    });
  }

  try {
    const user = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;

    if (user.role === role) {
      console.log("user :", user);
      return res.status(200).json({
        status: "ok",
        userData: user,
      });
    } else {
      return res.status(403).json({
        status: "Forbidden",
        message: "ระดับสิทธิ์ไม่ถูกต้อง",
        detail: "กรุณาตรวจสอบหน้าเข้าสู่ระบบ และ ระดับสิทธิ์ของบัญชีคุณ",
      });
    }
  } catch (error) {
    const isTokenExpired =
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError;

    if (isTokenExpired) {
      const user = jwt.decode(authHeader) as JwtPayload;
      if (user) {
        try {
          // บันทึก log การ logout
          const logoutLog = new LogoutLogSchema({
            userId: user.id,
            email: user.email,
            reason: "token หมดอายุ",
            ip: req.ip || "Unknown IP",
            logoutAt: new Date(),
          });
          await logoutLog.save();
        } catch (dbError) {
          const err = dbError as Error;
          return res.status(500).json({
            status: "Error",
            message: "เกิดข้อผิดพลาดในบันทึกประวัติการออกจากระบบ",
            error: err.message,
          });
        }
      }
      return res.status(401).json({
        status: "Unauthorized",
        message: "Token หมดอายุ",
        detail: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
      });
    }

    const err = error as Error;
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
      error: err.message,
    });
  }
};
