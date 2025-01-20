import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  UserLogSchema,
  encryptData,
  JWT_SECRET,
  bcrypt,
} from "../../utils/constants";

const User = UserSchema;
const UserLog = UserLogSchema;
export const createUser = async (req: Request, res: Response) => {
  const {
    email,
    role,
    nationalId,
    titleName,
    firstName,
    lastName,
    phoneNumber,
    startDate,
    department,
    status,
  } = req.body;

  const authHeader = req.cookies?.token;
  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    if (!["admin", "super_admin"].includes(decodedToken.role)) {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการสร้างบัญชีผู้ใช้",
      });
    }

    if (!email.includes("@")) {
      return res
        .status(400)
        .json({ status: "Bad Request", message: "รูปแบบ email ไม่ถูกต้อง" });
    }

    const existingEmail = await User.findOne({
      email: encryptData(email),
      status: { $in: ["active", "inactive"] },
    });

    if (existingEmail) {
      res.status(400).json({
        status: "Bad Request",
        message: "อีเมลนี้มีบัญชีอยู่แล้ว",
        data: existingEmail,
      });
    }

    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      return res.status(400).json({
        status: "Bad Request",
        message: "เบอร์โทรต้องเป็นตัวเลข 10 หลัก",
      });
    }

    if (nationalId.length !== 13 || !/^\d+$/.test(nationalId)) {
      return res.status(400).json({
        status: "Bad Request",
        message: "เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก",
      });
    }

    const existingPhone = await User.findOne({
      phoneNumber: encryptData(phoneNumber),
      status: { $in: ["active", "inactive"] },
    });
    if (existingPhone) {
      return res.status(400).json({
        status: "Bad Request",
        message: "เบอร์โทรนี้มีบัญชีอยู่แล้ว",
      });
    }

    const existingID = await User.findOne({
      nationalId: encryptData(nationalId),
      status: { $in: ["active", "inactive"] },
    });
    if (existingID) {
      return res.status(400).json({
        status: "Bad Request",
        message: "เลขประจำตัวประชาชนมีบัญชีอยู่แล้ว",
      });
    }

    if (
      titleName !== "นาย" &&
      titleName !== "นาง" &&
      titleName !== "นางสาว" &&
      titleName !== "อื่นๆ"
    ) {
      return res.status(400).json({
        status: "Bad Request",
        message: "คำนำหน้าชื่อไม่ถูกต้อง",
        detail: "คำนำหน้าชื่อควรเป็น นาย, นาง, นางสาว หรือ อื่นๆ",
      });
    }

    const encryptedEmail = encryptData(email.toLowerCase());
    const encryptedNationalId = encryptData(nationalId);
    const encryptedFirstName = encryptData(firstName);
    const encryptedLastName = encryptData(lastName);
    const encryptedPhoneNumber = encryptData(phoneNumber);

    const hashedPassword = await bcrypt.hash(nationalId, 10);

    const newStatus =
      decodedToken.role === "admin" && role === "admin" ? "inactive" : status;

    const confirmedBy =
      role === "employee" ||
      (decodedToken.role === "super_admin" &&
        (role === "admin" || role == "super_admin"))
        ? {
            userId: decodedToken.id,
            name: decodedToken.fullName,
          }
        : null;

    const newUser = new User({
      email: encryptedEmail,
      password: hashedPassword,
      role,
      nationalId: encryptedNationalId,
      titleName,
      firstName: encryptedFirstName,
      lastName: encryptedLastName,
      phoneNumber: encryptedPhoneNumber,
      startDate,
      department,
      status: newStatus,
      createdBy: {
        userId: decodedToken.id,
        name: decodedToken.fullName,
      },
      confirmedBy,
    });

    const savedUser = await newUser.save();
    await UserLog.create({
      action: "create",
      userId: savedUser._id,
      performedBy: {
        userId: decodedToken.id,
        name: decodedToken.fullName,
      },
    });
    if (savedUser) {
      return res.status(201).json({
        status: "Success",
        message:
          role === "employee" ||
          (decodedToken.role === "super_admin" && role === "admin")
            ? "สร้างบัญชีผู้ใช้สำเร็จ"
            : "สร้างบัญชีผู้ใช้สำเร็จ กรุณารอการยืนยันจากผู้ดูแล",
        user: savedUser,
      });
    }
  } catch (error) {
    const err = error as Error;
    return res.status(400).json({
      status: "Error",
      message: "สร้างบัญชีไม่สำเร็จ",
      error: err.message,
    });
  }
};
