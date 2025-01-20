import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  JWT_SECRET,
  decryptData,
} from "../../utils/constants";
const User = UserSchema;

export const getUserDelete = async (req: Request, res: Response) => {
  const authHeader = req.cookies?.token;

  // ตรวจสอบว่า token ถูกส่งมาหรือไม่
  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    // ตรวจสอบ token
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    if (!decodedToken) {
      return res.status(403).json({
        status: "Forbidden",
        message: "ไม่สามารถยืนยันตัวตนของผู้ใช้ได้",
      });
    }
    if (!["admin", "super_admin"].includes(decodedToken.role)) {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้",
      });
    }

    let users;

    // แยกการดึงข้อมูลตามสิทธิ์ของผู้ใช้
    if (decodedToken.role === "admin") {
      users = await User.find({ status: "deleted", role: "employee" }).populate(
        "department",
        "name"
      );
    } else if (decodedToken.role === "super_admin") {
      users = await User.find({ status: "deleted" }).populate(
        "department",
        "name"
      );
    }

    // หากไม่พบข้อมูล
    if (!users || users.length === 0) {
      return res.status(404).json({
        status: "Not Found",
        message: "ไม่พบผู้ใช้ที่ถูกลบ",
      });
    }

    // เตรียมข้อมูลเพื่อตอบกลับ
    const usersData = users.map((user) => ({
      id: user._id,
      email: decryptData(user.email),
      role: user.role,
      name: `${decryptData(user.firstName)} ${decryptData(user.lastName)}`,
      phoneNumber: decryptData(user.phoneNumber),
      startDate: user.startDate,
      department:
        typeof user.department === "object" && "name" in user.department
          ? user.department.name
          : null,
      status: user.status,
    }));

    // ส่งข้อมูลกลับ
    return res.status(200).json({
      status: "success",
      message: "ดึงข้อมูลผู้ใช้ที่ถูกลบสำเร็จ",
      data: usersData,
    });
  } catch (error) {
    console.error("Error fetching deleted users:", error);
    return res.status(500).json({
      status: "error",
      message: "ไม่สามารถดึงข้อมูลผู้ใช้ที่ถูกลบได้",
    });
  }
};
