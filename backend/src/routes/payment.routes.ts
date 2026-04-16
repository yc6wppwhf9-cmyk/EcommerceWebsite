import { Router } from 'express';
import * as PaymentController from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protect these routes so only logged in users can initiate payments
router.post('/create-order', authenticateToken, PaymentController.createOrder);
router.post('/verify', authenticateToken, PaymentController.verifyPayment);

export default router;
