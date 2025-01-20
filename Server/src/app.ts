import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

import usersRoutes from "./routes/usersRoutes";
import authRoutes from "./routes/authRoutes";
import courseRoutes from "./routes/courseRoutes";

import { checkExpiryAndNotify } from "./controller/course/expiryCourseEmail";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["SET-COOKIE"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
dotenv.config();

app.use("/api/users", usersRoutes);
app.use("/api/course", courseRoutes);
app.use("/auth", authRoutes);

setInterval(checkExpiryAndNotify, 24 * 60 * 60 * 1000);

export default app;
