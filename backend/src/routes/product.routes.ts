import { Router } from 'express';
import * as ProductController from '../controllers/product.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { productSchema } from '../types/schemas';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/:slug', ProductController.getProductBySlug);
router.post('/', authenticateToken, requireAdmin, validate(productSchema), ProductController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, validate(productSchema.partial()), ProductController.updateProduct);

export default router;
