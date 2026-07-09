import express from "express";
import { chatWithPolicyBot } from "../../controllers/chat.controller.js";

const router = express.Router();

router.post("/chat", chatWithPolicyBot);

export default router;
