import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { blockProduct, createProduct, deleteProduct, getAllProducts, getProductByGender, getProductById, getProducts, getProductsToAdmin, searchProduct, updateProduct } from "../controllers/productController.js";
import { getFilteredProducts } from "../controllers/productFiltersController.js";

const router = express.Router();

router.post("/addProduct", isAuth, isAdminAuth, createProduct)
router.get("/getProducts", getProducts)
router.get("/getAllProducts",isAuth, isAdminAuth, getAllProducts)
router.get("/getProductsToAdmin", getProductsToAdmin)
router.get("/product-detial/:id", getProductById)
router.get("/product-By-query", getProductByGender)
router.put("/product-modify/:id", isAuth, isAdminAuth, updateProduct)
router.put("/activate-product/:id", isAuth, isAdminAuth, blockProduct)
router.delete("/product-removeing/:id", isAuth, isAdminAuth, deleteProduct)
router.get("/filter-items", getFilteredProducts)
router.get("/search", searchProduct)

export default router; 
