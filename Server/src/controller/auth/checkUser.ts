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
      return res.error(
        404,
        "ไม่พบบัญชีผู้ใช้",
        "บัญชีนี้ถูกตั้งสถานะเป็นโดนลบ"
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.error(400, "รหัสผ่านไม่ถูกต้อง");
    }

    const JWT_userID = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "2h",
    });

    (req.session as any).JWT_userID = JWT_userID;

    if (user.policyAccepted === null) {
      return res.error(
        410,
        "กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนเข้าสู่ระบบ",
        { policy: "นโยบายการเก็บข้อมูลผู้ใช้..." },
        "/auth/accept_policy",
        "info"
      );
    }

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
  const token = (req.session as any).token;

  if (!token) {
    return res.error(401, "ไม่พบ token");
  }

  let decodedToken: JwtPayload | null = null;
  let reason = "ออกจากระบบ";

  try {
    decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    reason = "token หมดอายุ";
    decodedToken = jwt.decode(token) as JwtPayload; // Decode token หากหมดอายุ
  }

  if (!decodedToken || !decodedToken.id || !decodedToken.role) {
    return res.error(401, "Token ไม่ถูกต้อง");
  }

  const { id: userId, role } = decodedToken;

  try {
    const logoutLog = new LogoutLogSchema({
      userId,
      role,
      reason,
      ip: req.ip || "Unknown IP",
      logoutAt: new Date(),
    });

    await logoutLog.save();

    req.session.destroy((err) => {
      if (err) {
        return res.error(500, "เกิดข้อผิดพลาดในการลบ session", err.message);
      }

      return res.success("Logout สำเร็จ");
    });
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการบันทึก log การออกจากระบบ",
      (error as Error).message
    );
  }
};
