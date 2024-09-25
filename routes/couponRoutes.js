import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { addCoupon, applyCoupon, deleteCoupon, getAvailableCoupons, getCouponsAdmin, removeCoupon } from "../controllers/couponController.js";

const router = express.Router()

router.post("/create-coupon", isAuth, isAdminAuth, addCoupon)
router.get("/get-all-coupons", isAuth, isAdminAuth, getCouponsAdmin)
router.delete("/delete-coupon/:couponId", isAuth, isAdminAuth, deleteCoupon)
router.get("/avlible-coupons", isAuth, getAvailableCoupons)
router.post("/apply-coupon", isAuth, applyCoupon)
router.post("/remove-coupon", isAuth, removeCoupon)

export default router; 