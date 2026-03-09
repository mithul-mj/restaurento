import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../../controllers/payment.controller.js';
import { verifyRole } from '../../middlewares/auth.middleware.js';
import ROLES from '../../constants/roles.js';

const router = express.Router();

router.post('/payments/create-order', verifyRole(ROLES.USER), createRazorpayOrder);
router.post('/payments/verify', verifyRole(ROLES.USER), verifyRazorpayPayment);

export default router;
