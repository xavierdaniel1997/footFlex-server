import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { getWalletDetials } from "../controllers/walletController.js";

const router = express.Router()

router.get("/my-wallet", isAuth, getWalletDetials)

export default router;