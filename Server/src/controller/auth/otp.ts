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
    } else if (!user.otpExpires || currentTime > user.otpExpires) {
      await LoginLogSchema.create({
        userId: user._id,
        email: decryptData(user.email),
        success: false,
        ip: req.ip,
      });
      return res.error(400, "OTP หมดอายุ", null, null, "warning");
    } else {
      await LoginLogSchema.create({
        userId: user._id,
        email: decryptData(user.email),
        success: true,
        ip: req.ip,
      });
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
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.TRAINIFY_EMAIL,
      pass: process.env.TRAINIFY_EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Trainify Project <no-reply@trainify.com>",
    to: email,
    subject: "รหัสยืนยัน OTP - Trainify",
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Kanit', Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        .email-header {
          background-color: #3498db;
          color: #ffffff;
          padding: 20px;
          text-align: center;
        }
        .email-content {
          padding: 30px;
          color: #333333;
          line-height: 1.6;
        }
        .email-footer {
          background-color: #f9f9f9;
          padding: 15px;
          text-align: center;
          font-size: 12px;
          color: #777777;
          border-top: 1px solid #e0e0e0;
        }
        .highlight {
          background-color: #f8f9fa;
          border-left: 4px solid #3498db;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 4px 4px 0;
        }
        .otp-code {
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 5px;
          text-align: center;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 6px;
          margin: 15px 0;
          color: #333;
        }
        .ref-code {
          text-align: center;
          font-family: monospace;
          font-size: 16px;
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h2 style="margin: 0;">Trainify - ยืนยันตัวตน</h2>
        </div>
        <div class="email-content">
          <p>สวัสดีครับ,</p>
          <p>กรุณาใช้รหัส OTP นี้เพื่อยืนยันตัวตนในระบบ Trainify:</p>
          
          <div class="highlight">
            <div class="ref-code">รหัสอ้างอิง: <strong>${otpREF}</strong></div>
            <div class="otp-code">${otp}</div>
            <p style="text-align: center; margin: 15px 0 0 0;">รหัสนี้จะหมดอายุภายใน <strong>2 นาที</strong></p>
          </div>
          
          <p>หากคุณไม่ได้ร้องขอรหัสนี้ กรุณาละเลยอีเมลฉบับนี้</p>
        </div>
        <div class="email-footer">
          <p>© ${new Date().getFullYear()} Trainify. สงวนลิขสิทธิ์.</p>
          <p>หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อทีมสนับสนุน</p>
        </div>
      </div>
    </body>
    </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`OTP ถูกส่งไปยังอีเมล: ${email}`);
};
