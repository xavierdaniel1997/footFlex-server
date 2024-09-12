import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { dashboardStatus, getBestItems, salesChart } from "../controllers/dashboardController.js";

const router = express.Router()

router.get("/status", isAuth, isAdminAuth, dashboardStatus)
router.get("/sales-chart", isAuth, isAdminAuth, salesChart)
router.get("/top-most", isAuth, isAdminAuth, getBestItems)

export default router;