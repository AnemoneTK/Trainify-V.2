import { Router } from "express";
import authRoutes from "./auth.routes";
// import userRoutes from "./user.routes";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

// Routes ที่ไม่ต้องการการยืนยันตัวตน
router.use("/auth", authRoutes);

// Routes ที่ต้องการการยืนยันตัวตน
// router.use("/users", isAuthenticated, userRoutes);

export default router;
