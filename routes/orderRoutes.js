import express from "express";
import {isAdminAuth, isAuth} from "../middleware/isAuth.js";
import {
  allOrderDetails,
  createOrder,
  getOrderById,
  createRazorpayOrder,
  updateOrderStatus,
  userOrders,
  verifyRazorpayPayment,
  updateOrderItemStatus,
  cancelOrder,
  returnOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/place-order", isAuth, createOrder);
router.get("/my-orders", isAuth, userOrders);
router.get("/order-lists", isAuth, isAdminAuth, allOrderDetails);
router.get("/orderById/:orderId", isAuth, isAdminAuth, getOrderById);
router.put("/orderUpdate/:orderId", isAuth, isAdminAuth, updateOrderStatus);
router.put("/update-order-item-status/:orderId/:productId", isAuth, isAdminAuth, updateOrderItemStatus)
router.post("/cancel-order", isAuth, cancelOrder)
router.post("/return-order", isAuth, returnOrder)


//online payments
router.post("/create-razorpay-order", isAuth, verifyRazorpayPayment)
router.post("/verify-razorpay-order", isAuth, createRazorpayOrder)

export default router;
