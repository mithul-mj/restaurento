import express from "express";
import { getPaymentDashboard, getTransactionDetails } from "../../controllers/admin/adminPayment.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import ROLES from "../../constants/roles.js";

const router = express.Router();

router.use(verifyRole(ROLES.ADMIN));

router.get("/dashboard", getPaymentDashboard);
router.get("/transactions/:id", getTransactionDetails);

export default router;
