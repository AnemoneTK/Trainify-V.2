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
    departmentID,
    status,
  } = req.body;

  const authHeader = (req.session as any)?.userData;
  if (!authHeader) {
    return res.error(401, "ไม่พบ token");
  }

  const userRole = authHeader.role;
  try {
    if (!["admin", "super_admin"].includes(userRole)) {
      return res.error(403, "คุณไม่มีสิทธิ์ในการสร้างบัญชีผู้ใช้");
    }

    if (!email.includes("@")) {
      return res.error(400, "รูปแบบ email ไม่ถูกต้อง");
    }

    const existingEmail = await User.findOne({
      email: encryptData(email),
      status: { $in: ["active", "inactive"] },
    });

    if (existingEmail) {
      return res.error(400, "อีเมลนี้มีบัญชีอยู่แล้ว", existingEmail);
    }

    if (phoneNumber.length !== 10 || !/^\d+$/.test(phoneNumber)) {
      return res.error(400, "เบอร์โทรต้องเป็นตัวเลข 10 หลัก");
    }

    if (nationalId.length !== 13 || !/^\d+$/.test(nationalId)) {
      return res.error(400, "เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก");
    }

    const existingPhone = await User.findOne({
      phoneNumber: encryptData(phoneNumber),
      status: { $in: ["active", "inactive"] },
    });

    if (existingPhone) {
      return res.error(400, "เบอร์โทรนี้มีบัญชีอยู่แล้ว");
    }

    const existingID = await User.findOne({
      nationalId: encryptData(nationalId),
      status: { $in: ["active", "inactive"] },
    });

    if (existingID) {
      return res.error(400, "เลขประจำตัวประชาชนมีบัญชีอยู่แล้ว");
    }

    if (!["นาย", "นาง", "นางสาว", "อื่นๆ"].includes(titleName)) {
      return res.error(400, "คำนำหน้าชื่อไม่ถูกต้อง", {
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
      userRole === "admin" && role === "admin" ? "inactive" : status;

    const confirmedBy =
      role === "employee" ||
      (userRole === "super_admin" &&
        (role === "admin" || role == "super_admin"))
        ? {
            userId: authHeader.id,
            name: authHeader.fullName,
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
      department: departmentID,
      status: newStatus,
      createdBy: {
        userId: authHeader.id,
        name: authHeader.fullName,
      },
      confirmedBy,
    });

    const savedUser = await newUser.save();

    await UserLog.create({
      action: "create",
      userId: savedUser._id,
      performedBy: {
        userId: authHeader.id,
        name: authHeader.fullName,
      },
    });

    return res.success(
      role === "employee" || (userRole === "super_admin" && role === "admin")
        ? "สร้างบัญชีผู้ใช้สำเร็จ"
        : "สร้างบัญชีผู้ใช้สำเร็จ กรุณารอการยืนยันจากผู้ดูแล",
      { user: savedUser }
    );
  } catch (error) {
    const err = error as Error;
    return res.error(500, "สร้างบัญชีไม่สำเร็จ", err.message);
  }
};
