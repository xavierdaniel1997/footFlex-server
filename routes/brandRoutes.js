import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { addBrand, getBrand } from "../controllers/brandController.js";

const router = express.Router();

router.post("/addNewBrand", isAuth, isAdminAuth, addBrand);
router.get("/getAllBrands", getBrand)

export default router;