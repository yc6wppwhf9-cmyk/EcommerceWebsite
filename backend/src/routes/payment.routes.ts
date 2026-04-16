import { Router } from 'express';
import * as PaymentController from '../controllers/payment.controller';
import { protect } from '../middleware/auth';

const router = Router();

// Protect these routes so only logged in users can initiate payments
router.post('/create-order', protect, PaymentController.createOrder);
router.post('/verify', protect, PaymentController.verifyPayment);

export default router;
控制,Description:
