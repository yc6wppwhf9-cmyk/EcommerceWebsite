import { Router } from 'express';
import * as PaymentController from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

router.post('/create-order', authenticateToken, validateCsrf, PaymentController.createOrder);
router.post('/verify', authenticateToken, validateCsrf, PaymentController.verifyPayment);

export default router;
