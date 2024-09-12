import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { downloadSalesReport, generateSalesReport } from "../controllers/salesAndDetialsController.js";

const router = express.Router()

router.get("/sales-report", isAuth, isAdminAuth, generateSalesReport)
router.get("/sales-report/download", isAuth, isAdminAuth, downloadSalesReport)

export default router;