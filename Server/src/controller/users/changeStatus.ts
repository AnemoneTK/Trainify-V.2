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
  const authHeader = (req.session as any).userData;

  if (!authHeader) {
    return res.error(401, "ไม่พบ token");
  }

  const userRole = authHeader.role;

  try {
    if (!userID) {
      return res.error(400, "กรุณาระบุ userID");
    }

    const user = await User.findById(userID);
    if (!user) {
      return res.error(404, "ไม่พบผู้ใช้");
    }
    if (user.status === "deleted") {
      return res.error(404, "ไม่พบผู้ใช้ที่ถูกลบแล้ว");
    }

    if (userRole !== "super_admin" && userRole !== "admin") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะบัญชีนี้");
    }
    if (userRole === "admin" && user.role !== "employee") {
      return res.error(403, "คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะบัญชีนี้");
    }

    const newStatus = user.status === "active" ? "inactive" : "active";

    // บันทึกประวัติการเปลี่ยนแปลง
    const log = new UserLog({
      action: "change_status",
      userId: user._id,
      performedBy: {
        userId: authHeader.id,
        name: authHeader.fullName,
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
    return res.success(`เปลี่ยนสถานะผู้ใช้เป็น ${newStatus} สำเร็จ`, {
      firstName: decryptData(user.firstName),
      newStatus: newStatus,
    });
  } catch (error) {
    const err = error as Error;
    return res.error(500, "เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้ใช้", err.message);
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
