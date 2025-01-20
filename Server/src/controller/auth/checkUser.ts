import {
  Request,
  Response,
  bcrypt,
  jwt,
  JwtPayload,
  UserSchema,
  encryptData,
  decryptData,
  JWT_SECRET,
} from "../../utils/constants";
import LogoutLogSchema from "../../models/logoutLogSchema";
import { error } from "console";
const User = UserSchema;

export const checkUser = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({
      status: "warning",
      message: "กรุณากรอกข้อมูลให้ครบถ้วน",
    });
  }
  const encryptedEmail = encryptData(email);
  if (!email.includes("@")) {
    return res
      .status(400)
      .json({ status: "warning", message: "รูปแบบ email ไม่ถูกต้อง" });
  }
  try {
    const user = await User.findOne({ email: encryptedEmail });
    if (!user) {
      return res.status(404).json({
        status: "warning",
        message: "ไม่พบบัญชีผู้ใช้",
      });
    } else {
      if (user.role !== role) {
        return res.status(400).json({
          status: "warning",
          message: "สิทธิ์การเข้าถึงไม่ถูกต้อง",
        });
      }
      if (user.status === "inactive") {
        return res.status(400).json({
          status: "warning",
          message: "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแล",
        });
      }
      if (user.role === "admin" && !user.confirmedBy) {
        return res.status(400).json({
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

      const JWT_userID = jwt.sign(
        {
          id: user._id,
        },
        JWT_SECRET,
        { expiresIn: "2h" }
      );
      //เก็บ token เป็น cookie
      res.cookie("JWT_userID", JWT_userID, {
        httpOnly: true,
        secure: true,
        maxAge: 2 * 60 * 60 * 1000, // ระยะเวลาหมดอายุของ cookie (2 ชั่วโมง)
      });

      if (user.policyAccepted === null) {
        return res.status(410).json({
          status: "policy",
          message: "กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนเข้าสู่ระบบ",
          policy:
            "นโยบายการเก็บข้อมูลผู้ใช้\n\nเว็บไซต์ของเรามีการเก็บข้อมูลบางประการเพื่อปรับปรุงประสบการณ์การใช้งานของผู้ใช้ และเพื่อการวิเคราะห์ข้อมูล โดยเฉพาะอย่างยิ่ง เราเก็บข้อมูลที่อยู่ IP ของผู้ใช้ ซึ่งช่วยให้เราสามารถ:\n\n1. ปรับปรุงบริการ: การเก็บข้อมูล IP ช่วยให้เราสามารถวิเคราะห์การเข้าถึงเว็บไซต์และปรับปรุงประสิทธิภาพของบริการให้ดียิ่งขึ้น\n2. รักษาความปลอดภัย: ข้อมูล IP จะช่วยให้เราสามารถตรวจสอบและป้องกันการเข้าถึงที่ไม่พึงประสงค์หรือการกระทำที่เป็นอันตราย\n3. วิเคราะห์ข้อมูล: เราอาจใช้ข้อมูล IP เพื่อวิเคราะห์พฤติกรรมการใช้งานของผู้ใช้ และเพื่อพัฒนาผลิตภัณฑ์และบริการของเรา\n\nเราให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้ และจะไม่เปิดเผยข้อมูล IP ของคุณให้กับบุคคลที่สามโดยไม่ได้รับความยินยอมจากคุณ ยกเว้นในกรณีที่กฎหมายกำหนดหรือเพื่อปกป้องสิทธิ์ของเรา\n\nโดยการเข้าถึงหรือใช้งานเว็บไซต์ของเรา คุณยอมรับนโยบายการเก็บข้อมูลนี้ หากคุณไม่เห็นด้วยกับนโยบายดังกล่าว กรุณาหยุดการใช้งานเว็บไซต์ของเรา",
          nextStep: "/auth/accept_policy",
        });
      } else {
        return res.status(200).json({
          status: "success",
          message: "เข้าสู่ระบบสำเร็จ กรุณาสร้าง OTP",
          nextStep: "/auth/create_otp",
        });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", Error: error });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const token = req.cookies?.token;

  try {
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

    if (!decodedToken || !decodedToken.id || !decodedToken.email) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "Token ไม่ถูกต้อง",
      });
    }

    // ตรวจสอบและถอดรหัสข้อมูล
    let userId, email;
    try {
      userId = decodedToken.id;
      email = decodedToken.email;
    } catch (decryptError) {
      const err = decryptError as Error;
      return res.status(500).json({
        status: "Error",
        message: "เกิดข้อผิดพลาดในการถอดรหัสข้อมูลผู้ใช้",
        error: err.message,
      });
    }

    // บันทึกเหตุการณ์ Logout
    const logoutLog = new LogoutLogSchema({
      userId,
      email,
      reason,
      ip: req.ip || "Unknown IP",
      logoutAt: new Date(),
    });

    await logoutLog.save();

    res.clearCookie("token");

    return res.status(200).json({
      status: "Success",
      message: "Logout สำเร็จ",
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในออกจากระบบ",
      error: err.message,
    });
  }
};
