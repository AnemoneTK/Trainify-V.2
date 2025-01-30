import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  LoginLogSchema,
  decryptData,
  otpGenerator,
  nodemailer,
  JWT_SECRET,
} from "../../utils/constants";

const User = UserSchema;

export const createOtp = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userID;

    if (!userId) return res.error(403, "ไม่พบรหัสผู้ใช้", "กรุณาเข้าสู่ระบบ");

    const user = await User.findById(userId.id);
    if (!user) return res.error(404, "ไม่พบผู้ใช้");

    const currentTime = Date.now();
    const otpCooldown = 120000; // 2 นาที

    if (
      user.lastOtpSentTime &&
      currentTime - user.lastOtpSentTime.getTime() < otpCooldown
    ) {
      const remainingTime = Math.ceil(
        (otpCooldown - (currentTime - user.lastOtpSentTime.getTime())) / 1000
      );
      return res.success(
        `กรุณารออีก ${remainingTime} วินาที`,
        { ref: user.otpREF, waitingTime: remainingTime },
        null,
        "info"
      );
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    const otpREF = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: true,
      specialChars: false,
      digits: true,
    });

    await sendOtpEmail(decryptData(user.email), otp, otpREF);

    user.otp = otp;
    user.otpREF = otpREF;
    user.otpExpires = currentTime + otpCooldown;
    user.lastOtpSentTime = new Date();
    await user.save();

    return res.success(
      "OTP ถูกส่งไปยังอีเมล",
      { ref: otpREF, waitingTime: otpCooldown / 1000 },
      "/auth/verify_otp"
    );
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการสร้าง OTP",
      (error as Error).message
    );
  }
};

export const resetOtp = async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userID;

    if (!userId) return res.error(403, "ไม่พบรหัสผู้ใช้", "กรุณาเข้าสู่ระบบ");

    const user = await User.findById(userId.id);
    if (!user) return res.error(404, "ไม่พบผู้ใช้");

    const currentTime = Date.now();
    const otpCooldown = 120000; // 2 นาที

    if (
      user.lastOtpSentTime &&
      currentTime - user.lastOtpSentTime.getTime() < otpCooldown
    ) {
      const remainingTime = Math.ceil(
        (otpCooldown - (currentTime - user.lastOtpSentTime.getTime())) / 1000
      );
      return res.success(
        `กรุณารออีก ${remainingTime} วินาที`,
        { ref: user.otpREF, waitingTime: remainingTime },
        null,
        "info"
      );
    }

    const newOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });
    const newOtpREF = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: true,
      specialChars: false,
      digits: true,
    });

    await sendOtpEmail(decryptData(user.email), newOtp, newOtpREF);

    user.otp = newOtp;
    user.otpREF = newOtpREF;
    user.otpExpires = currentTime + otpCooldown;
    user.lastOtpSentTime = new Date();
    await user.save();

    return res.success(
      "OTP ใหม่ถูกส่งไปยังอีเมลของคุณ",
      { ref: newOtpREF, waitingTime: otpCooldown / 1000 },
      "/auth/verify_otp"
    );
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการรีเซ็ต OTP",
      (error as Error).message
    );
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { otp } = req.body;

  try {
    const userId = (req.session as any).userID;

    if (!userId) return res.error(403, "ไม่พบ token ยืนยันตัวตน");

    const user = await User.findById(userId.id);
    if (!user) return res.error(404, "ไม่พบผู้ใช้");

    const currentTime = Date.now();

    if (user.otp !== otp) {
      await LoginLogSchema.create({
        userId: user._id,
        email: decryptData(user.email),
        success: false,
        ip: req.ip,
      });
      return res.error(400, "OTP ไม่ถูกต้อง", null, null, "warning");
    }

    if (!user.otpExpires || currentTime > user.otpExpires) {
      await LoginLogSchema.create({
        userId: user._id,
        email: decryptData(user.email),
        success: false,
        ip: req.ip,
      });
      return res.error(400, "OTP หมดอายุ", null, null, "warning");
    }

    const userData = {
      id: user._id,
      email: decryptData(user.email),
      role: user.role,
      name: decryptData(user.firstName),
      fullName: `${decryptData(user.firstName)} ${decryptData(user.lastName)}`,
      department: user.department,
    };

    user.otp = undefined;
    user.otpREF = undefined;
    user.otpExpires = undefined;
    user.lastOtpSentTime = null;
    await user.save();

    (req.session as any).userData = userData;
    return res.success(
      "OTP ถูกต้อง",
      { role: user.role, waitingTime: 0 },
      "/dashboard"
    );
  } catch (error) {
    return res.error(
      500,
      "เกิดข้อผิดพลาดในการตรวจสอบ OTP",
      (error as Error).message
    );
  }
};

// ฟังก์ชันส่งอีเมล OTP
const sendOtpEmail = async (email: string, otp: string, otpREF: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.Trainify_Email,
      pass: process.env.Trainify_Email_Password,
    },
  });

  const mailOptions = {
    from: "Trainify Project <no-reply@trainify.com>",
    to: email,
    subject: `Trainify OTP`,
    html: `
      <p>รหัสอ้างอิง: ${otpREF}</p>
      <p>รหัส OTP: <strong>${otp}</strong></p>
      <p>กรุณาใช้รหัสนี้ภายใน 2 นาที</p>
      <p>หากคุณไม่ได้ร้องขอ กรุณาละเลยอีเมลนี้</p>
      <p>ขอบคุณ, ทีมงาน Trainify</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP ถูกส่งไปยังอีเมล: ${email}`);
};
