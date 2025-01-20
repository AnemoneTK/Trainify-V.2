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
  const { userID } = req.body;
  const authHeader = req.cookies?.token;

  // ตรวจสอบ token ใน cookies
  if (!authHeader) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "ไม่พบ token",
    });
  }

  try {
    // ตรวจสอบและถอดรหัส token
    const decodedToken = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    if (!decodedToken) {
      return res.status(403).json({
        status: "No User",
        message: "ไม่พบผู้ใช้งาน",
      });
    }

    if (decodedToken.role === "admin") {
      let usersData;
      if (!userID || userID === "") {
        const users = await User.find({ role: "employee" }).populate(
          "department",
          "name"
        );
        usersData = users.map((user) => ({
          userID: user._id,
          name: `${user.titleName || ""} ${decryptData(
            user.firstName
          )} ${decryptData(user.lastName)}`,
          role: user.role,
          department:
            typeof user.department === "object" && "name" in user.department
              ? user.department.name
              : null,
          status: user.status,
          startDate: user.startDate,
          createdBy: user.createdBy?.name || "",
        }));
      } else {
        const users = await User.find({
          role: "employee",
          _id: userID,
        }).populate("department", "name");
        usersData = users.map((user) => ({
          userID: user._id,
          email: decryptData(user.email),
          titleName: user.titleName,
          firstName: decryptData(user.firstName),
          lastName: decryptData(user.lastName),
          phone: decryptData(user.phoneNumber),
          role: user.role,
          department:
            typeof user.department === "object" && "name" in user.department
              ? user.department.name
              : null,
          status: user.status,
          startDate: user.startDate,
        }));
      }
      return res.status(200).json({
        status: "ok",
        message: "ดึงข้อมูลสำเร็จ",
        data: usersData || "ไม่มีข้อมูลในระบ",
      });
    }
    if (decodedToken.role === "super_admin") {
      let usersData;
      if (!userID || userID === "") {
        const users = await User.find().populate("department", "name");
        usersData = users.map((user) => ({
          userID: user._id,
          name: `${user.titleName || ""} ${decryptData(
            user.firstName
          )} ${decryptData(user.lastName)}`,
          role: user.role,
          department:
            typeof user.department === "object" && "name" in user.department
              ? user.department.name
              : null,
          status: user.status,
          startDate: user.startDate,
          createdBy: user.createdBy?.name || "",
          confirmedBy: user.confirmedBy?.name,
        }));
      } else {
        const users = await User.find({
          _id: userID,
        }).populate("department", "name");
        usersData = users.map((user) => ({
          userID: user._id,
          email: decryptData(user.email),
          titleName: user.titleName,
          firstName: decryptData(user.firstName),
          lastName: decryptData(user.lastName),
          phone: decryptData(user.phoneNumber),
          role: user.role,
          department:
            typeof user.department === "object" && "name" in user.department
              ? user.department.name
              : null,
          status: user.status,
          startDate: user.startDate,
        }));
      }
      return res.status(200).json({
        status: "ok",
        message: "ดึงข้อมูลสำเร็จ",
        data: usersData || "ไม่มีข้อมูลในระบ",
      });
    }
    if (decodedToken.role === "employee") {
      let usersData;
      if (!userID || userID === "") {
        const users = await User.find().populate("department", "name");
        usersData = users.map((user) => ({
          userID: user._id,
          name: `${user.titleName || ""} ${decryptData(
            user.firstName
          )} ${decryptData(user.lastName)}`,
          role: user.role,
          department:
            typeof user.department === "object" && "name" in user.department
              ? user.department.name
              : null,
          status: user.status,
          startDate: user.startDate,
          createdBy: user.createdBy?.name || "",
          confirmedBy: user.confirmedBy?.name,
        }));
      } else {
        const users = await User.find({
          _id: userID,
        }).populate("department", "name");
        usersData = users.map((user) => ({
          userID: user._id,
          email: decryptData(user.email),
          titleName: user.titleName,
          firstName: decryptData(user.firstName),
          lastName: decryptData(user.lastName),
          phone: decryptData(user.phoneNumber),
          role: user.role,
          department:
            typeof user.department === "object" && "name" in user.department
              ? user.department.name
              : null,
          status: user.status,
          startDate: user.startDate,
        }));
      }
      return res.status(200).json({
        status: "ok",
        message: "ดึงข้อมูลสำเร็จ",
        data: usersData || "ไม่มีข้อมูลในระบ",
      });
    }
  } catch (error) {
    const err = error as Error;

    // จัดการข้อผิดพลาดและส่งข้อมูลกลับ
    return res.status(500).json({
      status: "error",
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้",
      error: err.message,
    });
  }
};
