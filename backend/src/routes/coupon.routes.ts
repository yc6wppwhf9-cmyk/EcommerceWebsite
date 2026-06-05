import { Router } from 'express';
import * as CouponController from '../controllers/coupon.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

router.post('/validate', authenticateToken, validateCsrf, CouponController.validateCoupon);
router.get('/', authenticateToken, requireAdmin, CouponController.listCoupons);
router.post('/', authenticateToken, requireAdmin, validateCsrf, CouponController.createCoupon);
router.patch('/:id/toggle', authenticateToken, requireAdmin, validateCsrf, CouponController.toggleCoupon);

export default router;
