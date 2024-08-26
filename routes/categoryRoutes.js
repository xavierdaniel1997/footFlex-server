import express from "express";
import { createCategory, deletCategoryById, getAllCategory, updateCategory } from "../controllers/categoryController.js";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";


const router = express.Router()

router.post("/createCategory", isAuth, isAdminAuth, createCategory)
router.get("/getCategorys", getAllCategory)
router.put("/updateCategory/:id", isAuth, isAdminAuth, updateCategory)
router.delete("/deleteCategory/:id", isAuth, isAdminAuth, deletCategoryById)

export default router;