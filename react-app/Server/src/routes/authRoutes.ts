import express from "express";
import { checkUser, logoutUser } from "../controller/auth/checkUser";
import { createOtp, verifyOtp, resetOtp } from "../controller/auth/otp";
import { acceptPolicy } from "../controller/auth/policy";
import { auth } from "../controller/auth/auth";

const router = express.Router();

router.post("/login", checkUser);
router.post("/create_otp", createOtp);
router.post("/verify_otp", verifyOtp);
router.get("/reset_otp", resetOtp);
router.post("/accept_policy", acceptPolicy);
router.post("/auth", auth);
router.get("/logout", logoutUser);

export default router;
