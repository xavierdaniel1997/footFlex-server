import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { createProduct, getProducts } from "../controllers/productController.js";

const router = express.Router();

router.post("/addProduct", isAuth, isAdminAuth, createProduct)
router.get("/getProducts", getProducts)

export default router;