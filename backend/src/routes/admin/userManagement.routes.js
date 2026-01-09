import { Router } from "express";
import {
  getAllUsers,
  toggleUserStatus,
} from "../../controllers/admin/userManagement.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllUsers);

router.patch("/:userId/toggle-status", toggleUserStatus);

export default router;
