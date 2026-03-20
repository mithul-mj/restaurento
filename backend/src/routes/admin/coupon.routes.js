import express from "express";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { couponSchema, updateCouponSchema } from "../../validators/coupon.validator.js";
import ROLES from "../../constants/roles.js";
import {
    createCoupon,
    getAllCoupons,
    updateCoupon,
    deleteCoupon,
    getCouponById
} from "../../controllers/admin/coupon.controller.js";

const router = express.Router();

// Apply middleware to restrict to admin
router.use(verifyRole(ROLES.ADMIN));

router.get("/", getAllCoupons);
router.post("/", validate(couponSchema), createCoupon);
router.put("/:id", validate(updateCouponSchema), updateCoupon);
router.delete("/:id", deleteCoupon);
router.get("/:id", getCouponById);

export default router;
