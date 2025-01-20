import {
  Request,
  Response,
  jwt,
  JwtPayload,
  UserSchema,
  JWT_SECRET,
} from "../../utils/constants";

const User = UserSchema;

export const acceptPolicy = async (req: Request, res: Response) => {
  const { acceptPolicy } = req.body;
  const userHeader = req.cookies.JWT_userID;
  const userId = jwt.verify(userHeader, JWT_SECRET) as JwtPayload;
  // ตรวจสอบว่าผู้ใช้ส่งค่า acceptPolicy มาหรือไม่
  if (acceptPolicy === false) {
    return res.status(400).json({
      status: "user not found",
      message: "คุณต้องยอมรับนโยบายความเป็นส่วนตัว",
    });
  }

  try {
    const user = await User.findById(userId.id);
    if (!user) {
      return res.status(400).json({
        status: "user not found",
        message: "คุณต้องยอมรับนโยบายความเป็นส่วนตัว",
      });
    }

    // อัปเดตสถานะการยอมรับนโยบาย
    user.policyAccepted = new Date();
    await user.save();

    res.status(200).json({ message: "ยอมรับนโยบายเรียบร้อยแล้ว" });
  } catch (error) {
    const err = error as Error;
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการยอมรับนโยบาย", err: err.message });
  }
};
