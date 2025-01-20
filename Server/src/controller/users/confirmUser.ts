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

export const confirmUser = async (req: Request, res: Response) => {
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
    if (decodedToken.role !== "super_admin") {
      return res.status(403).json({
        status: "Forbidden",
        message: "คุณไม่มีสิทธิ์ในการยืนยันบัญชีผู้ใช้ Admin",
      });
    }
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

    if (user.confirmedBy !== null) {
      return res.status(400).json({
        status: "ไม่พบข้อมูล",
        message: "บัญชีนี้ถูกยืนยันไปแล้ว",
      });
    }

    user.confirmedBy = {
      userId: decodedToken.id,
      name: decodedToken.fullName,
    };
    await user.save();
    const userLog = new UserLogSchema({
      action: "confirmed",
      userId: user._id,
      performedBy: {
        userId: decodedToken.id,
        name: decodedToken.fullName,
      },
      changes: {
        status: `ผู้ใช้ได้รับการยืนยันโดย ${decodedToken.fullName}`,
      },
      timestamp: new Date(),
    });

    await userLog.save(); // บันทึกการ log
    return res.status(200).json({
      status: "Success",
      message: "ยืนยันบัญชีผู้ใช้สำเร็จ",
      user,
    });
  } catch (error) {
    const err = error as Error;
    return res.status(500).json({
      status: "Error",
      message: "ยืนยันบัญชีไม่สำเร็จ",
      error: err.message,
    });
  }
};
