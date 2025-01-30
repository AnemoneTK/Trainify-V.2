import {
  Request,
  Response,
  bcrypt,
  jwt,
  JwtPayload,
  UserSchema,
  encryptData,
  JWT_SECRET,
} from "../../utils/constants";
import LogoutLogSchema from "../../models/logoutLogSchema";
import { ObjectId } from "mongodb";
const User = UserSchema;

export const checkUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.error(400, "กรุณากรอกข้อมูลให้ครบถ้วน");
  }

  if (!email.includes("@")) {
    return res.error(400, "รูปแบบ email ไม่ถูกต้อง");
  }

  const encryptedEmail = encryptData(email);

  try {
    const user = await User.findOne({ email: encryptedEmail });

    if (!user) {
      return res.error(404, "ไม่พบบัญชีผู้ใช้");
    }

    if (user.role !== role) {
      return res.error(403, "สิทธิ์การเข้าถึงไม่ถูกต้อง");
    }

    if (user.status === "inactive") {
      return res.error(403, "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแล");
    }

    if (user.role === "admin" && !user.confirmedBy) {
      return res.error(403, "บัญชีแอดมินต้องมีการยืนยัน กรุณารอ", null, "info");
    }

    if (user.status === "deleted") {
      return res.error(404, "ไม่พบบัญชีผู้ใช้");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.error(400, "รหัสผ่านไม่ถูกต้อง");
    }

    if (user.policyAccepted === null) {
      return res.error(
        410,
        "กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนเข้าสู่ระบบ",
        { policy: "นโยบายการเก็บข้อมูลผู้ใช้..." },
        "/auth/accept_policy",
        "info"
      );
    }

    const userID: { id: string; role: string } = {
      id: (user._id as ObjectId).toString(),
      role: user.role,
    };

    (req.session as any).userID = userID;

    return res.success(
      "เข้าสู่ระบบสำเร็จ กรุณาสร้าง OTP",
      null,
      "/auth/create_otp"
    );
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      (error as Error).message
    );
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = (req.session as any).token;

    if (!token || typeof token !== "string") {
      return res.error(401, "ไม่พบ token หรือ token ไม่ถูกต้อง");
    }

    let decodedToken: JwtPayload | null = null;
    let reason = "ออกจากระบบ";

    try {
      decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
      console.log("✅ Token Verified:", decodedToken);
    } catch (error) {
      reason = "token หมดอายุ";
      decodedToken = jwt.decode(token) as JwtPayload;
      console.log("⚠️ Token Expired:", decodedToken);
    }

    if (!decodedToken || !decodedToken.id || !decodedToken.role) {
      return res.error(401, "Token ไม่ถูกต้อง");
    }

    const { id: userId, role, email } = decodedToken;

    const userIp = req.ip || req.headers["x-forwarded-for"] || "Unknown IP";
    console.log("🔹 User Logout:", { userId, role, reason, ip: userIp });

    // บันทึก Log การออกจากระบบ
    await LogoutLogSchema.create({
      userId,
      role,
      email,
      reason,
      ip: userIp,
      logoutAt: new Date().toISOString(), // ใช้รูปแบบ ISO Date
    });

    // แปลง `req.session.destroy()` ให้เป็น Promise-based function
    const destroySession = () =>
      new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

    await destroySession();

    return res.success("Logout สำเร็จ");
  } catch (error) {
    console.error("❌ Logout Error:", error);
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการออกจากระบบ",
      (error as Error).message
    );
  }
};
