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
    return res.status(400).json({
      status: "warning",
      message: "กรุณากรอกข้อมูลให้ครบถ้วน",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      status: "warning",
      message: "รูปแบบ email ไม่ถูกต้อง",
    });
  }

  const encryptedEmail = encryptData(email);

  try {
    const user = await User.findOne({ email: encryptedEmail });

    if (!user) {
      return res.status(404).json({
        status: "warning",
        message: "ไม่พบบัญชีผู้ใช้",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        status: "warning",
        message: "สิทธิ์การเข้าถึงไม่ถูกต้อง",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        status: "warning",
        message: "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแล",
      });
    }

    if (user.role === "admin" && !user.confirmedBy) {
      return res.status(403).json({
        status: "info",
        message: "บัญชีแอดมินต้องมีการยืนยัน กรุณารอ",
      });
    }

    if (user.status === "deleted") {
      return res.status(404).json({
        status: "warning",
        message: "ไม่พบบัญชีผู้ใช้",
        info: "บัญชีนี้ถูกตั้งสถานะเป็นโดนลบ",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        status: "warning",
        message: "รหัสผ่านไม่ถูกต้อง",
      });
    }

    const JWT_userID = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "2h",
    });

    // เก็บ token ใน session
    req.session.token = JWT_userID;

    if (user.policyAccepted === null) {
      return res.status(410).json({
        status: "policy",
        message: "กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนเข้าสู่ระบบ",
        policy:
          "นโยบายการเก็บข้อมูลผู้ใช้\n\nเว็บไซต์ของเรามีการเก็บข้อมูลบางประการเพื่อปรับปรุงประสบการณ์การใช้งานของผู้ใช้ และเพื่อการวิเคราะห์ข้อมูล...",
        nextStep: "/auth/accept_policy",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "เข้าสู่ระบบสำเร็จ กรุณาสร้าง OTP",
      nextStep: "/auth/create_otp",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
      error: (error as Error).message,
    });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const token = req.session.token;

  if (!token) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
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
    return res.status(401).json({
      status: "Unauthorized",
      message: "Token ไม่ถูกต้อง",
    });
  }

  const { id: userId, role } = decodedToken;

  try {
    // บันทึกเหตุการณ์ Logout
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
        return res.status(500).json({
          status: "error",
          message: "เกิดข้อผิดพลาดในการลบ session",
          error: err.message,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Logout สำเร็จ",
      });
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการบันทึก log การออกจากระบบ",
      error: (error as Error).message,
    });
  }
};
