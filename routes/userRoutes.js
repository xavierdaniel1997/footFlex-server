import express from "express";
import { loginUser, logOutUser, registerUser, resendOTP, verifyOTP, verifyUser } from "../controllers/authController.js";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { blockUser, deleteUser, getAllUser, getUserDetials, updateUserDetials } from "../controllers/userController.js";

const router = express.Router()

router.post("/register", registerUser)
router.post("/verify-otp", verifyOTP)
router.post("/resend-otp", resendOTP)
router.post("/login", loginUser)
router.post("/logout", logOutUser)  
router.get("/verify", isAuth, verifyUser)


//user routes
router.get("/getUsers", isAuth,getUserDetials)
router.get("/customers", isAuth, isAdminAuth, getAllUser)
router.put("/update-user-detials", isAuth, updateUserDetials)
router.put("/product-status/:id", isAuth, isAdminAuth, blockUser)  
router.delete("/clear-user/:id", isAuth, isAdminAuth, deleteUser)
export default router;
  