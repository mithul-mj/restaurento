import express from "express";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { offerSchema, updateOfferSchema } from "../../validators/offer.validator.js";
import ROLES from "../../constants/roles.js";
import {
    createOffer,
    getMyOffers,
    updateOffer,
    toggleOfferStatus,
    deleteOffer
} from "../../controllers/restaurant/offer.controller.js";

const router = express.Router();

// Restrict to Restaurant role
router.use(verifyRole(ROLES.RESTAURANT));

router.get("/", getMyOffers);
router.post("/", validate(offerSchema), createOffer);
router.patch("/:id", validate(updateOfferSchema), updateOffer);
router.patch("/:id/toggle", toggleOfferStatus);
router.delete("/:id", deleteOffer);

export default router;
