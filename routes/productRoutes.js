import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { blockProduct, createProduct, deleteProduct, getProductByGender, getProductById, getProducts, updateProduct } from "../controllers/productController.js";

const router = express.Router();

router.post("/addProduct", isAuth, isAdminAuth, createProduct)
router.get("/getProducts", getProducts)
router.get("/product-detial/:id", getProductById)
router.get("/product-By-query", getProductByGender)
router.put("/product-modify/:id", isAuth, isAdminAuth, updateProduct)
router.put("/activate-product/:id", isAuth, isAdminAuth, blockProduct)
router.delete("/product-removeing/:id", isAuth, isAdminAuth, deleteProduct)

export default router;
