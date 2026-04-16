import { Router } from 'express';
import * as ReviewController from '../controllers/review.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewSchema } from '../types/schemas';

const router = Router();

router.get('/product/:productId', ReviewController.getReviewsByProduct);
router.post('/', authenticateToken, validate(reviewSchema), ReviewController.createReview);
router.delete('/:id', authenticateToken, ReviewController.deleteReview);

export default router;
