import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  UserLogSchema,
  encryptData,
  JWT_SECRET,
  nodemailer,
  bcrypt,
  decryptData,
} from "../../utils/constants";
const User = UserSchema;
const UserLog = UserLogSchema;
export const changeStatus = async (req: Request, res: Response) => {
  const { userID } = req.body;
  const authHeader = req.cookies?.token;

  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;

    if (!userID) {
      return res.status(400).json({
        status: "คำขอไม่ถูกต้อง",
        message: "กรุณาระบุ userID",
      });
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({
        status: "ไม่พบข้อมูล",
        message: "ไม่พบผู้ใช้",
      });
    }
    if (user.status === "deleted") {
      return res.status(404).json({
        status: "ไม่พบข้อมูล",
        message: "ไม่พบผู้ใช้ที่ถูกลบแล้ว",
      });
    }

    if (decodedToken.role !== "super_admin" && decodedToken.role !== "admin") {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะบัญชีนี้",
      });
    }
    if (decodedToken.role === "admin" && user.role !== "employee") {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะบัญชีนี้",
      });
    }

    const newStatus = user.status === "active" ? "inactive" : "active";

    // บันทึกประวัติการเปลี่ยนแปลง
    const log = new UserLog({
      action: "change_status",
      userId: user._id,
      performedBy: {
        userId: decodedToken.id,
        name: decodedToken.fullName,
      },
      changes: {
        status: `${user.status} -> ${newStatus}`,
      },
      timestamp: new Date(),
    });
    await log.save();

    user.status = newStatus;
    await user.save();

    await sendStatusChangeNotificationEmail(
      decryptData(user.email),
      newStatus,
      decryptData(user.firstName)
    );
    return res.status(200).json({
      status: "Success",
      message: `เปลี่ยนสถานะผู้ใช้เป็น ${newStatus} สำเร็จ`,
      data: {
        firstName: decryptData(user.firstName),
        newStatus: newStatus,
      },
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      status: "Error",
      message: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้",
      error: err.message,
    });
  }
};

const sendStatusChangeNotificationEmail = async (
  email: string,
  status: string,
  userName: string
) => {
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

  const subject =
    status === "active"
      ? "บัญชีของคุณถูกเปิดใช้งาน"
      : "บัญชีของคุณถูกปิดการใช้งาน";
  const statusMessage =
    status === "active"
      ? "บัญชีของคุณได้ถูกเปิดใช้งานแล้ว สามารถเข้าสู่ระบบ และใช้งานได้ตามปกติ"
      : "บัญชีของคุณได้ถูกปิดการใช้งานเรียบร้อยแล้ว หากต้องการใช้งานบัญชี กรุณาติดต่อพนักงานผู้ดูแล";

  const mailOptions = {
    from: "Trainify Project <no-reply@trainify.com>",
    to: email,
    subject: subject,
    html: `
          <p>สวัสดีคุณ ${userName},</p>
          <p>${statusMessage}</p>
          <p>ขอบคุณ,<br>ทีมงาน Trainify</p>
        `,
  };

  try {
    // ส่งอีเมล
    await transporter.sendMail(mailOptions);
    console.log("อีเมลแจ้งเตือนการเปิด/ปิดบัญชีถูกส่งไปยัง:", email);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการส่งอีเมล:", error);
  }
};
