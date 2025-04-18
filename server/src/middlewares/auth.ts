import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session && (req.session as any).userData) {
    return next();
  }

  // ไม่ใช้ return ข้างหน้า
  res.status(401).json({
    status: "error",
    message: "กรุณาเข้าสู่ระบบ",
    nextStep: "/login",
  });
  // จบฟังก์ชันโดยไม่มี return
};

export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !(req.session as any).userData) {
      // ไม่ใช้ return ข้างหน้า
      res.status(401).json({
        status: "error",
        message: "กรุณาเข้าสู่ระบบ",
        nextStep: "/login",
      });
      return; // แค่จบฟังก์ชัน
    }

    if (!roles.includes((req.session as any).userData.role)) {
      // ไม่ใช้ return ข้างหน้า
      res.status(403).json({
        status: "error",
        message: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",
        icon: "error",
      });
      return; // แค่จบฟังก์ชัน
    }

    next();
  };
};
