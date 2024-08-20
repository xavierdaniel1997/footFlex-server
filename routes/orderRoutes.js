import express from "express";
import {isAdminAuth, isAuth} from "../middleware/isAuth.js";
import {
  allOrderDetails,
  createOrder,
  getOrderById,
  updateOrderStatus,
  userOrders,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/place-order", isAuth, createOrder);
router.get("/my-orders", isAuth, userOrders);
router.get("/order-lists", isAuth, isAdminAuth, allOrderDetails);
router.get("/orderById/:orderId", isAuth, isAdminAuth, getOrderById);
router.put("/orderUpdate/:orderId", isAuth, isAdminAuth, updateOrderStatus)

export default router;
