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
    // ตรวจสอบ session token
    const userId =
      req.session.token &&
      (jwt.verify(req.session.token, JWT_SECRET) as JwtPayload);
    if (!userId) {
      return res.status(403).json({
        status: "error",
        message: "ไม่พบ token ยืนยันตัวตน",
      });
    }

    const user = await User.findById(userId.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "ไม่พบผู้ใช้",
      });
    }

    const currentTime = Date.now();
    const otpCooldown = 120000; // 2 นาที

    if (
      user.lastOtpSentTime &&
      currentTime - user.lastOtpSentTime.getTime() < otpCooldown
    ) {
      const remainingTime = Math.ceil(
        (otpCooldown - (currentTime - user.lastOtpSentTime.getTime())) / 1000
      );
      return res.status(200).json({
        status: "waiting",
        message: `กรุณารออีก ${remainingTime} วินาที`,
        ref: user.otpREF,
        time: remainingTime,
      });
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
    user.otpExpires = Date.now() + 120000; // หมดอายุใน 2 นาที
    user.lastOtpSentTime = new Date();
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "OTP ถูกส่งไปยังอีเมล",
      nextStep: "/auth/verify_otp",
      ref: otpREF,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการสร้าง OTP",
      error: (error as Error).message,
    });
  }
};

export const resetOtp = async (req: Request, res: Response) => {
  try {
    // ตรวจสอบ session token
    const userId =
      req.session.token &&
      (jwt.verify(req.session.token, JWT_SECRET) as JwtPayload);

    if (!userId) {
      return res.status(403).json({
        status: "error",
        message: "ไม่พบ token ยืนยันตัวตน",
      });
    }

    const user = await User.findById(userId.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "ไม่พบผู้ใช้",
      });
    }

    const currentTime = Date.now();
    const otpCooldown = 120000; // 2 นาที

    // ตรวจสอบว่าผู้ใช้ยังอยู่ในช่วง cooldown หรือไม่
    if (
      user.lastOtpSentTime &&
      currentTime - user.lastOtpSentTime.getTime() < otpCooldown
    ) {
      const remainingTime = Math.ceil(
        (otpCooldown - (currentTime - user.lastOtpSentTime.getTime())) / 1000
      );
      return res.status(200).json({
        status: "waiting",
        message: `กรุณารออีก ${remainingTime} วินาทีเพื่อรีเซ็ต OTP ใหม่`,
        ref: user.otpREF,
        time: remainingTime,
      });
    }

    // สร้าง OTP และ OTP reference ใหม่
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

    // ส่ง OTP ไปยังอีเมลของผู้ใช้
    await sendOtpEmail(decryptData(user.email), newOtp, newOtpREF);

    // อัปเดตข้อมูลผู้ใช้
    user.otp = newOtp;
    user.otpREF = newOtpREF;
    user.otpExpires = Date.now() + otpCooldown;
    user.lastOtpSentTime = new Date();
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "OTP ใหม่ถูกส่งไปยังอีเมลของคุณ",
      ref: newOtpREF,
      time: otpCooldown / 1000, // แปลงเป็นวินาที
      nextStep: "/auth/verify_otp",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการรีเซ็ต OTP",
      error: (error as Error).message,
    });
  }
};

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
    subject: `Trainify OTP Reference: ${otpREF}`,
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

export const verifyOtp = async (req: Request, res: Response) => {
  const { otp } = req.body;

  try {
    const userId =
      req.session.token &&
      (jwt.verify(req.session.token, JWT_SECRET) as JwtPayload);
    if (!userId) {
      return res.status(403).json({
        status: "error",
        message: "ไม่พบ token ยืนยันตัวตน",
      });
    }

    const user = await User.findById(userId.id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "ไม่พบผู้ใช้",
      });
    }

    const currentTime = Date.now();
    if (user.otp !== otp) {
      await LoginLogSchema.create({
        userId: user._id,
        email: decryptData(user.email),
        success: false,
        ip: req.ip,
      });
      return res.status(400).json({
        status: "warning",
        message: "OTP ไม่ถูกต้อง",
      });
    }

    if (!user.otpExpires || currentTime > user.otpExpires) {
      await LoginLogSchema.create({
        userId: user._id,
        email: decryptData(user.email),
        success: false,
        ip: req.ip,
      });
      return res.status(400).json({
        status: "warning",
        message: "OTP หมดอายุ",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: decryptData(user.email),
        role: user.role,
        name: decryptData(user.firstName),
        fullName: `${decryptData(user.firstName)} ${decryptData(
          user.lastName
        )}`,
        department: user.department,
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    user.otp = undefined;
    user.otpREF = undefined;
    user.otpExpires = undefined;
    user.lastOtpSentTime = null;
    await user.save();

    req.session.token = token;
    return res.status(200).json({
      status: "success",
      message: "OTP ถูกต้อง",
      role: user.role,
      nextStep: "/dashboard",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการตรวจสอบ OTP",
      error: (error as Error).message,
    });
  }
};
