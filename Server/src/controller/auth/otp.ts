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
    // Verify JWT and extract user ID
    const userId = jwt.verify(req.cookies.JWT_userID, JWT_SECRET) as JwtPayload;
    // Find the user by ID
    const user = await UserSchema.findById(userId.id);
    if (!user || !userId) {
      return res.status(403).json({
        status: "error",
        message: "ไม่พบผู้ใช้",
      });
    }

    const currentTime = Date.now();
    const otpCooldown = 120000; // 2 นาที

    // Check if the user is still in the cooldown period
    if (user.lastOtpSentTime) {
      if (currentTime - user.lastOtpSentTime.getTime() < otpCooldown) {
        return res.status(200).json({
          status: "Waiting for otp",
          message: `กรุณารออีก ${
            (otpCooldown - (currentTime - user.lastOtpSentTime.getTime())) /
            1000
          } วินาที`,
          time: `${
            (otpCooldown - (currentTime - user.lastOtpSentTime.getTime())) /
            1000
          }`,
          ref: user.otpREF,
        });
      }
    }

    // Generate OTP and OTP reference
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

    // Send OTP email
    await sendOtpEmail(decryptData(user.email), otp, otpREF);

    // Update user with new OTP details
    user.otp = otp;
    user.otpREF = otpREF;
    user.otpExpires = Date.now() + 120000; // หมดอายุใน 2 นาที
    user.lastOtpSentTime = new Date(); // อัปเดตเวลาส่ง OTP ล่าสุด
    await user.save();

    // Respond with success message
    return res.status(200).json({
      status: "otp sent",
      message: "กรุณาตรวจสอบรหัส OTP ในอีเมล",
      time: `${
        (otpCooldown - (currentTime - user.lastOtpSentTime.getTime())) / 1000
      }`,
      ref: otpREF,
      userID: user._id,
      nextStep: "/auth/verify_otp",
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการสร้าง OTP",
      error: err.message,
    });
  }
};

//Send OTP
const sendOtpEmail = async (email: string, otp: string, otpREF: string) => {
  const Trainify_Email = process.env.Trainify_Email;
  const Trainify_Password = process.env.Trainify_Email_Password;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: Trainify_Email,
      pass: Trainify_Password,
    },
  });

  const mailOptions = {
    from: "Trainify Project <no-reply@trainify.com>",
    to: email,
    subject: `Trainify <${otpREF}>`,
    html: `
      <p>รหัสอ้างอิง: ${otpREF}</p>
      <p>รหัสยืนยันตัวตนของคุณคือ: <strong>${otp}</strong></p>
      <p>กรุณาใช้รหัสนี้เพื่อยืนยันตัวตนของคุณภายใน 5 นาที หากคุณไม่ได้ทำการเข้าสู่ระบบ กรุณาละเลยอีเมลนี้</p>
      <p>หากคุณมีคำถามเพิ่มเติม สามารถติดต่อเราที่ <a href="mailto:support@trainify.com">support@trainify.com</a></p>
      <p>ขอบคุณ,<br>ทีมงาน Trainify</p>
    `,
  };
  // ส่งอีเมล
  await transporter.sendMail(mailOptions);
  console.log("อีเมลถูกส่งไปยัง:", email);
};

// verify otp
export const verifyOtp = async (req: Request, res: Response) => {
  const { otp } = req.body;
  const userId = jwt.verify(req.cookies.JWT_userID, JWT_SECRET) as JwtPayload;

  try {
    //หาผู้ใช้เพื่อนำ OTP ในฐานข้อมูลมาเปรียบเทียบ
    const user = await User.findById(userId.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "ไม่พบผู้ใช้" });
    }

    // ตรวจสอบ OTP และเวลาหมดอายุ
    const currentTime = Date.now();
    if (user.otp !== otp) {
      await LoginLogSchema.create({
        userId: user._id,
        email: decryptData(user.email),
        success: false,
        ip: req.ip,
      });
      return res
        .status(400)
        .json({ status: "warning", message: "OTP ไม่ถูกต้อง" });
    }
    if (user.otpExpires === undefined || currentTime > user.otpExpires) {
      await LoginLogSchema.create({
        userId: user._id,
        email: decryptData(user.email),
        success: false,
        ip: req.ip,
      });
      return res
        .status(400)
        .json({ status: "warning", message: "OTP หมดอายุ" });
    }

    // ถ้าทุกอย่างถูกต้องทำการสร้าง JWT
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
      { expiresIn: "2h" } // ตั้งเวลาหมดอายุของ token
    );

    // ลบ OTP และเวลาหมดอายุออกจากผู้ใช้
    user.otp = undefined;
    user.otpREF = undefined;
    user.otpExpires = undefined;
    user.lastOtpSentTime = null;
    await user.save();

    await LoginLogSchema.create({
      userId: user._id,
      email: user.email,
      success: true,
      ip: req.ip,
    });

    //เก็บ token เป็น cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 2 * 60 * 60 * 1000, // ระยะเวลาหมดอายุของ cookie (2 ชั่วโมง)
    });
    res.clearCookie("JWT_userID");
    return res.status(200).json({
      status: "Login Success",
      message: "OTP ถูกต้อง",
      role: user.role,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "เกิดข้อผิดพลาดในการตรวจสอบ OTP" });
  }
};

export const resetOtp = async (req: Request, res: Response) => {
  const userId = jwt.verify(req.cookies.JWT_userID, JWT_SECRET) as JwtPayload;

  if (!userId) {
    return res.status(400).json({ message: "กรุณาระบุ userId" });
  }

  try {
    // Use findById to get a single user document
    const user = await UserSchema.findById(userId.id);
    if (!user) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    // สร้าง OTP ใหม่
    const newOtp = otpGenerator.generate(6, {
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

    await sendOtpEmail(decryptData(user.email), newOtp, otpREF);
    const currentTime = Date.now();
    const otpCooldown = 120000; // 2 นาที
    user.otp = newOtp;
    user.otpExpires = Date.now() + 120000;
    user.lastOtpSentTime = new Date();
    await user.save();

    res.status(200).json({
      message: "OTP ใหม่ถูกส่งไปยังอีเมลของคุณ",
      ref: `${otpREF}`,
      time: `${
        (otpCooldown - (currentTime - user.lastOtpSentTime.getTime())) / 1000
      }`,
      userID: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการรีเซ็ต OTP", error });
  }
};
