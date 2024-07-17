import express from "express";
import { loginUser, registerUser, resendOTP, verifyOTP } from "../controllers/authController.js";

const router = express.Router()

router.post("/register", registerUser)
router.post("/verify-otp", verifyOTP)
router.post("/resend-otp", resendOTP)
router.post("/login", loginUser)
export default router;
