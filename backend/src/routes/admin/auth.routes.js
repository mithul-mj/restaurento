import express from "express";
import { loginAdmin, logout } from "../../controllers/admin/adminAuth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginSchema } from "../../validators/common.schemas.js";

const router = express.Router();

router.post("/login", validate(loginSchema), loginAdmin);
router.post("/logout", logout);

export default router;
