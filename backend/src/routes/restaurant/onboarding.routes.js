import express from "express";
import { onboardingUploads, submitOnboarding } from "../../controllers/restaurant/onboarding.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { onboardingSchema } from "../../validators/restaurantValidation.js";

const router = express.Router();

router.post(
    "/complete-onboarding", validate(onboardingSchema),
    verifyJWT,
    onboardingUploads,
    submitOnboarding
);

export default router;