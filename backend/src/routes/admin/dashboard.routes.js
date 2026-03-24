import express from "express";
import { getDashboardStats } from "../../controllers/admin/dashboard.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import ROLES from "../../constants/roles.js";

const router = express.Router();

router.get("/stats", verifyRole(ROLES.ADMIN), getDashboardStats);

export default router;
