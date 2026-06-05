import { Router } from 'express';
import * as AnalyticsController from '../controllers/analytics.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

router.post('/view/:product_id', AnalyticsController.trackProductView);
router.get('/view/:product_id', AnalyticsController.getProductViewCount);
router.post('/abandoned-cart', authenticateToken, requireAdmin, validateCsrf, AnalyticsController.sendAbandonedCartEmails);

export default router;
