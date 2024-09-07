import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { generateSalesReport } from "../controllers/salesAndDetialsController.js";

const router = express.Router()

router.get("/sales-report", isAuth, isAdminAuth, generateSalesReport)

export default router;