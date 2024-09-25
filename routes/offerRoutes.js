import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { createOffer, deleteOffer, getOffers } from "../controllers/offerController.js";

const router = express.Router();

router.post("/add-offer", isAuth, isAdminAuth, createOffer);
router.get("/all-offers", isAuth, isAdminAuth, getOffers)
router.delete("/remove-offer/:offerId", isAuth, isAdminAuth, deleteOffer)

export default router