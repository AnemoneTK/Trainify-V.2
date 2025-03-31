import {
  Request,
  Response,
  UserSchema,
  decryptData,
} from "../../utils/constants";
const User = UserSchema;

export const getUserDelete = async (req: Request, res: Response) => {
  const sessionData = (req.session as any)?.userData;
  if (!sessionData) {
    return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  try {
    // ตรวจสอบสิทธิ์: admin สามารถดูเฉพาะ employee, super_admin ดูได้ทั้งหมด
    if (!["admin", "super_admin"].includes(sessionData.role)) {
      return res.error(403, "คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้");
    }

    let users;
    if (sessionData.role === "admin") {
      users = await User.find({ status: "deleted", role: "employee" }).populate(
        "department",
        "name"
      );
    } else if (sessionData.role === "super_admin") {
      users = await User.find({ status: "deleted" }).populate(
        "department",
        "name"
      );
    }

    if (!users || users.length === 0) {
      return res.error(404, "ไม่พบผู้ใช้ที่ถูกลบ");
    }

    const usersData = users.map((user) => ({
      id: user._id,
      email: decryptData(user.email),
      role: user.role,
      name: `${decryptData(user.firstName)} ${decryptData(user.lastName)}`,
      phoneNumber: decryptData(user.phoneNumber),
      startDate: user.startDate,
      department:
        user.department &&
        typeof user.department === "object" &&
        "name" in user.department
          ? (user.department as { name: string }).name
          : null,
      status: user.status,
    }));

    return res.success("ดึงข้อมูลผู้ใช้ที่ถูกลบสำเร็จ", usersData);
  } catch (error) {
    console.error("Error fetching deleted users:", error);
    return res.error(
      500,
      "ไม่สามารถดึงข้อมูลผู้ใช้ที่ถูกลบได้",
      (error as Error).message
    );
  }
};
