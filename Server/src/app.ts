import express, { Request, Response } from "express";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

import usersRoutes from "./routes/usersRoutes";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";

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

app.use(formatResponse);

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
dotenv.config();

app.use("/api/users", usersRoutes);
app.use("/api/course", courseRoutes);
app.use("/auth", authRoutes);

setInterval(checkExpiryAndNotify, 24 * 60 * 60 * 1000);

export default app;
