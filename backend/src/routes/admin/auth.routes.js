import express from "express";
import { loginAdmin } from "../../controllers/admin/auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
    loginSchema,
} from "../../validators/common.schemas.js";

const router = express.Router();

router.post("/login", validate(loginSchema), loginAdmin);

export default router;
