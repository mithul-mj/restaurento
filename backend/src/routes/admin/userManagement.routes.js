import { Router } from "express";
import {
  getAllUsers,
  toggleUserStatus,
} from "../../controllers/admin/userManagement.controller.js";
import { verifyRole } from "../../middlewares/auth.middleware.js";
import ROLES from "../../constants/roles.js";

const router = Router();

router.use(verifyRole(ROLES.ADMIN));

router.route("/").get(getAllUsers);

router.patch("/:userId/toggle-status", toggleUserStatus);

export default router;
