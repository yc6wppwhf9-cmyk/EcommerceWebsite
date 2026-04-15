import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { orderSchema } from '../types/schemas';

const router = Router();

router.get('/', authenticateToken, OrderController.getOrders);
router.get('/:id', authenticateToken, OrderController.getOrderById);
router.post('/', authenticateToken, validate(orderSchema), OrderController.createOrder);
router.patch('/:id/status', authenticateToken, requireAdmin, OrderController.updateOrderStatus);

export default router;
