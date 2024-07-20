import express from "express";
import { loginUser, logOutUser, registerUser, resendOTP, verifyOTP, verifyUser } from "../controllers/authController.js";
import { isAuth } from "../middleware/isAuth.js";
import { getUserDetials } from "../controllers/userController.js";

const router = express.Router()

router.post("/register", registerUser)
router.post("/verify-otp", verifyOTP)
router.post("/resend-otp", resendOTP)
router.post("/login", loginUser)
router.post("/logout", logOutUser)  
router.get("/verify", isAuth, verifyUser)  

router.get("/getUsers", isAuth,getUserDetials)
export default router;
  