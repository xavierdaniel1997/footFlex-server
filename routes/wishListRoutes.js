import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { addItemToWishList, getWishListItems, removeItemFromWishList } from "../controllers/wishListController.js";

const router = express.Router()

router.post("/addtoWishList", isAuth, addItemToWishList)
router.delete("/removeItem/:productId", isAuth, removeItemFromWishList)
router.get("/showItems", isAuth, getWishListItems)

export default router