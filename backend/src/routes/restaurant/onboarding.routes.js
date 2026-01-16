import express from "express";
import { onboardingUploads, submitOnboarding, preApprovalUploads } from "../../controllers/restaurant/onboarding.controller.js";
import { preApprovalRestaurant } from "../../controllers/restaurant/restaurant.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { onboardingSchema, preApprovalSchema } from "../../validators/restaurantValidation.js";
import ROLES from "../../constants/roles.js";

const router = express.Router();
router.use(verifyRole(ROLES.RESTAURANT));

router.post(
    "/complete-onboarding",
    onboardingUploads,
    validate(onboardingSchema),
    submitOnboarding
);

router.post(
    "/pre-approval",
    preApprovalUploads,
    validate(preApprovalSchema),
    preApprovalRestaurant
);


export default router;