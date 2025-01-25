import {
  Request,
  Response,
  jwt,
  JwtPayload,
  JWT_SECRET,
} from "../../utils/constants";
import LogoutLogSchema from "../../models/logoutLogSchema";

export const auth = async (req: Request, res: Response) => {
  const { role } = req.body;
  const authToken = (req.session as any).token;

  console.log("authToken:", authToken);

  // ตรวจสอบว่า token มีค่าหรือไม่
  if (!authToken) {
    return res.error(
      401,
      "ไม่พบ token ยืนยันตัวตน",
      { detail: "กรุณาเข้าสู่ระบบอีกครั้ง" },
      null,
      "error"
    );
  }

  try {
    // ตรวจสอบ token
    const user = jwt.verify(authToken, JWT_SECRET) as JwtPayload;

    if (user.role === role) {
      console.log("User authenticated successfully:", user);
      return res.success(
        "ยืนยันตัวตนสำเร็จ",
        { userData: user },
        "/dashboard",
        "success"
      );
    } else {
      return res.error(
        403,
        "ระดับสิทธิ์ไม่ถูกต้อง",
        { detail: "กรุณาตรวจสอบระดับสิทธิ์ของบัญชีคุณ" },
        null,
        "error"
      );
    }
  } catch (error) {
    const isTokenExpired =
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError;

    if (isTokenExpired) {
      const user = jwt.decode(authToken) as JwtPayload;
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
          return res.error(
            500,
            "เกิดข้อผิดพลาดในบันทึกประวัติการออกจากระบบ",
            { error: err.message },
            null,
            "error"
          );
        }
      }
      return res.error(
        401,
        "Token หมดอายุ",
        { detail: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง" },
        "/login",
        "error"
      );
    }

    const err = error as Error;
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
      { error: err.message },
      null,
      "error"
    );
  }
};
