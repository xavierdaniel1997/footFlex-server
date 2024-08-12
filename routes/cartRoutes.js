import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { addToCart, getCartDetails, removeFromCart, updateCart } from "../controllers/cartController.js";

const router = express.Router()

router.post("/addItem", isAuth, addToCart)
router.get("/show-cart", isAuth, getCartDetails)
router.put("/cart-update/:productId", isAuth, updateCart)
router.delete("/remove-item/:productId", isAuth, removeFromCart)

export default router;