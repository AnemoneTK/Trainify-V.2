import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);

  // ตั้งค่าเริ่มต้น
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // ตอบกลับ client
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: process.env.NODE_ENV === "development" ? err : {},
    icon: "error",
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`ไม่พบ API สำหรับ ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
};
