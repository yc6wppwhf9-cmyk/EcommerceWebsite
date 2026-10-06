import { Router } from 'express';
import * as ReviewController from '../controllers/review.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { validateCsrf } from '../middleware/csrf';
import { reviewSchema } from '../types/schemas';

const router = Router();

router.get('/product/:productId', ReviewController.getReviewsByProduct);
router.get('/product/:productId/marketplace', ReviewController.getMarketplaceReviewsByProduct);
router.post('/', authenticateToken, validateCsrf, validate(reviewSchema), ReviewController.createReview);
router.delete('/:id', authenticateToken, validateCsrf, ReviewController.deleteReview);

export default router;
