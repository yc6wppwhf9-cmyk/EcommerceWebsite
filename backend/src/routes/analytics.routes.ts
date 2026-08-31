import { Router } from 'express';
import * as AnalyticsController from '../controllers/analytics.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

router.post('/view/:product_id', AnalyticsController.trackProductView);
router.get('/view/:product_id', AnalyticsController.getProductViewCount);
router.post('/click/:product_id/:marketplace', AnalyticsController.trackMarketplaceClick);
// Back-compat for any cached frontend bundle still hitting the old Amazon-only endpoint.
router.post('/amazon-click/:product_id', (req, res) => {
  (req.params as any).marketplace = 'amazon';
  AnalyticsController.trackMarketplaceClick(req, res);
});
router.post('/abandoned-cart', authenticateToken, requireAdmin, validateCsrf, AnalyticsController.sendAbandonedCartEmails);

export default router;
