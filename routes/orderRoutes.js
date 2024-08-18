import express from "express";
import { isAuth } from "../middleware/isAuth.js"; 
import { createOrder } from "../controllers/orderController.js";

const router = express.Router()

router.post("/place-order", isAuth, createOrder)

export default router;