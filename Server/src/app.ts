import express from "express";
const session = require("express-session");
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cron from "node-cron";

import usersRoutes from "./routes/usersRoutes";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";
import errorHandler from "./middlewares/errorHandler";
import { checkExpiryAndNotify } from "./controller/course/expiryCourseEmail";
import formatResponse from "./middlewares/formatResponse";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["SET-COOKIE"],
  })
);

app.use(helmet());
app.use(formatResponse);
dotenv.config();

app.use(errorHandler);
const key = process.env.DATABASE_URL as string;
app.use(
  session({
    secret: key,
    resave: false, // ไม่บันทึก session ซ้ำเมื่อไม่มีการเปลี่ยนแปลง
    saveUninitialized: true, // บันทึก session ที่ไม่มีค่า
    cookie: {
      secure: false, // เปลี่ยนเป็น true เมื่อใช้ HTTPS
      httpOnly: true, // ป้องกันการเข้าถึงคุกกี้จาก JavaScript
      maxAge: 43200000, // 12 ชั่วโมง (12 * 60 * 60 * 1000)
    },
  })
);
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
dotenv.config();

app.use("/api/users", usersRoutes);
app.use("/api/course", courseRoutes);
app.use("/auth", authRoutes);

// รันทุกวันเวลาเที่ยงคืน
cron.schedule("0 0 * * *", checkExpiryAndNotify);

export default app;
