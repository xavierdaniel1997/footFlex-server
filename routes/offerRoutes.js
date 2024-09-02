import express from "express";
import { isAdminAuth, isAuth } from "../middleware/isAuth.js";
import { createOffer, getOffers } from "../controllers/offerController.js";

const router = express.Router();

router.post("/add-offer", isAuth, isAdminAuth, createOffer);
router.get("/all-offers", isAuth, isAdminAuth, getOffers)

export default router