import { Request, Response, decryptData } from "../../utils/constants";
import LoginLog from "../../models/loginLogSchema";
import LogoutLog from "../../models/logoutLogSchema";
import User from "../../models/userSchema";

export const getLogs = async (req: Request, res: Response) => {
  const sessionData = (req.session as any)?.userData;

  // ตรวจสอบว่า sessionData มีข้อมูลผู้ใช้หรือไม่
  if (!sessionData) {
    return res.error(401, "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
  }

  // ตรวจสอบสิทธิ์ผู้ใช้จาก session
  if (!["super_admin"].includes(sessionData.role)) {
    return res.error(403, "คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้");
  }

  try {
    // Fetch the login logs, logout logs, and populate user information
    const loginLogs = await LoginLog.find().populate(
      "userId",
      "email firstName lastName phoneNumber"
    );
    const logoutLogs = await LogoutLog.find().populate(
      "userId",
      "email firstName lastName phoneNumber"
    );

    // Create a new object with decrypted user data
    const loginLogsWithDecryptedData = await Promise.all(
      loginLogs.map(async (log) => {
        const user = log.userId as any;
        if (user) {
          const userData = {
            email: decryptData(user.email),
            titleName: user.titleName,
            firstName: decryptData(user.firstName),
            lastName: decryptData(user.lastName),
            phoneNumber: decryptData(user.phoneNumber),
          };

          return {
            ...log.toObject(),
            userData, // Add the decrypted user data as a new field
          };
        }
        return log; // Return the log as is if user is not found
      })
    );

    const logoutLogsWithDecryptedData = await Promise.all(
      logoutLogs.map(async (log) => {
        const user = log.userId as any;
        if (user) {
          const userData = {
            email: decryptData(user.email),
            titleName: user.titleName,
            firstName: decryptData(user.firstName),
            lastName: decryptData(user.lastName),
            phoneNumber: decryptData(user.phoneNumber),
          };

          return {
            ...log.toObject(),
            userData, // Add the decrypted user data as a new field
          };
        }
        return log; // Return the log as is if user is not found
      })
    );

    // Return the logs with decrypted user data
    return res.success("ดึงข้อมูลสำเร็จ", {
      loginLogs: loginLogsWithDecryptedData,
      logoutLogs: logoutLogsWithDecryptedData,
    });
  } catch (error) {
    const err = error as Error;
    return res.error(500, "ไม่สามารถดึงข้อมูล logs ได้", err.message);
  }
};
