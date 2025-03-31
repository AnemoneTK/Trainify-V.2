import { Request, Response, UserSchema } from "../../utils/constants";

const User = UserSchema;

export const acceptPolicy = async (req: Request, res: Response) => {
  const { acceptPolicy } = req.body;

  const sessionData = (req.session as any)?.userID;

  if (!sessionData) {
    return res.error(401, "Session หมดอายุ กรุณากรอกข้อมูลใหม่");
  }

  const userId = sessionData.id;

  // ตรวจสอบว่าผู้ใช้ยอมรับนโยบายหรือไม่
  if (acceptPolicy === false) {
    return res.error(400, "คุณต้องยอมรับนโยบายความเป็นส่วนตัว");
  }

  try {
    // ค้นหาผู้ใช้จากฐานข้อมูล
    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, "ไม่พบผู้ใช้");
    }

    // อัปเดตสถานะการยอมรับนโยบาย
    user.policyAccepted = new Date();
    await user.save();

    // ส่งผลลัพธ์การอัปเดตสถานะการยอมรับนโยบาย
    return res.success("ยอมรับนโยบายเรียบร้อยแล้ว");
  } catch (error) {
    const err = error as Error;
    return res.error(500, "เกิดข้อผิดพลาดในการยอมรับนโยบาย", err.message);
  }
};
