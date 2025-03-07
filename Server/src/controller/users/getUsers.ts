import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  decryptData,
  JWT_SECRET,
} from "../../utils/constants";
import Department from "../../models/departmentSchema";

const User = UserSchema;

export const getUsers = async (req: Request, res: Response) => {
  const authHeader = (req.session as any)?.userData; // ดึง token จาก session

  // ตรวจสอบ token ใน session
  if (!authHeader) {
    return res.error(401, "ไม่พบรหัสผู้ใช้", "กรุณาเข้าสู่ระบบ");
  }

  const userRole = authHeader.role;
  try {
    const prepareUserData = (users: any[]) => {
      return users.map((user) => ({
        userID: user._id,
        email: decryptData(user.email),
        titleName: user.titleName || "",
        firstName: decryptData(user.firstName),
        lastName: decryptData(user.lastName),
        phoneNumber: decryptData(user.phoneNumber),
        role: user.role,
        departmentID: user.department,
        department:
          typeof user.department === "object" && "name" in user.department
            ? user.department.name
            : null,
        status: user.status,
        startDate: user.startDate,
        createdBy: user.createdBy?.name || "",
        confirmedBy: user.confirmedBy?.name,
      }));
    };

    if (userRole === "admin") {
      // Admin สามารถดูข้อมูลของ employee เท่านั้น
      let usersData;
      const { userID } = req.body;
      if (!userID || userID === "") {
        const users = await User.find({ role: "employee" }).populate(
          "department",
          "name"
        );
        usersData = prepareUserData(users);
      } else {
        const users = await User.find({
          role: "employee",
          _id: userID,
        }).populate("department", "name");
        usersData = prepareUserData(users);
      }

      return res.success(
        "ดึงข้อมูลสำเร็จ",
        usersData.length ? usersData : "ไม่มีข้อมูลในระบบ"
      );
    }

    if (userRole === "super_admin") {
      // Super Admin สามารถดูข้อมูลทั้งหมด (admin, employee)
      let usersData;
      const { userID } = req.body;
      if (!userID || userID === "") {
        const users = await User.find().populate("department", "name");
        usersData = prepareUserData(users);
      } else {
        const users = await User.find({ _id: userID }).populate(
          "department",
          "name"
        );
        usersData = prepareUserData(users);
      }

      return res.success(
        "ดึงข้อมูลสำเร็จ",
        usersData.length ? usersData : "ไม่มีข้อมูลในระบบ"
      );
    }

    return res.error(403, "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  } catch (error) {
    const err = error as Error;

    // จัดการข้อผิดพลาดและส่งข้อมูลกลับ
    return res.error(500, "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้", err.message);
  }
};
