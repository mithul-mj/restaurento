import express from 'express';
import { verifyRazorpayPayment } from '../../controllers/payment.controller.js';
import { verifyRole } from '../../middlewares/auth.middleware.js';
import ROLES from '../../constants/roles.js';

const router = express.Router();

router.post('/payments/verify', verifyRole(ROLES.USER), verifyRazorpayPayment);

export default router;
