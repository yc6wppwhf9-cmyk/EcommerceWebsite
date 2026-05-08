import { Router } from 'express';
import * as ProductController from '../controllers/product.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { productSchema } from '../types/schemas';
import multer from 'multer';
import { storage } from '../config/cloudinary';

const router = Router();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
const memoryStorage = multer.memoryStorage();
const uploadExcel = multer({ storage: memoryStorage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', ProductController.getProducts);
router.get('/:slug', ProductController.getProductBySlug);
router.post('/', authenticateToken, requireAdmin, validate(productSchema), ProductController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, validate(productSchema.partial()), ProductController.updateProduct);

// New: Image Upload and Bulk Upload
router.post('/upload-image', authenticateToken, requireAdmin, upload.single('image'), ProductController.uploadImage);
router.post('/bulk-upload', authenticateToken, requireAdmin, uploadExcel.single('file'), ProductController.bulkUpload);
router.delete('/:id', authenticateToken, requireAdmin, ProductController.deleteProduct);

export default router;
