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
  const sessionData = (req.session as any)?.userData;

  // ตรวจสอบ session หมดอายุหรือไม่มีข้อมูล
  if (!sessionData) {
    try {
      //  บันทึก log การ logout
      const logoutLog = new LogoutLogSchema({
        userId: sessionData.id || "unknown",
        email: sessionData.email || "unknown",
        reason: "Session หมดอายุ",
        ip: req.ip || "Unknown IP",
        logoutAt: new Date(),
      });
      await logoutLog.save();
    } catch (dbError) {
      console.error("Error logging logout event:", dbError);
      return res.error(
        500,
        "เกิดข้อผิดพลาดในการบันทึกการออกจากระบบ",
        { error: (dbError as Error).message },
        null,
        "error"
      );
    }

    return res.error(
      401,
      "Session หมดอายุ",
      "กรุณาเข้าสู่ระบบใหม่",
      "/login",
      "warning"
    );
  }

  try {
    const user = sessionData;

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
        "สิทธิ์ไม่ถูกต้อง",
        { detail: "กรุณาตรวจสอบสิทธิ์ของบัญชีคุณ" },
        null,
        "error"
      );
    }
  } catch (error) {
    console.error("Authentication error:", error);

    return res.error(
      500,
      "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
      { error: (error as Error).message },
      null,
      "error"
    );
  }
};
