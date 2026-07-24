import { Router } from 'express';
import * as ProductController from '../controllers/product.controller';
import { authenticateToken, optionalAuthenticate, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';
import { validate } from '../middleware/validate';
import { productSchema } from '../types/schemas';
import multer from 'multer';

const router = Router();
const memoryStorage = multer.memoryStorage();
const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
  },
});
const uploadCatalogue = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const supported = /\.(xlsx|xls|csv)$/i.test(file.originalname);
    callback(null, supported);
  },
});

router.get('/', optionalAuthenticate, ProductController.getProducts);
router.get('/:slug', ProductController.getProductBySlug);
router.post('/', authenticateToken, requireAdmin, validateCsrf, validate(productSchema), ProductController.createProduct);
router.put('/:id', authenticateToken, requireAdmin, validateCsrf, validate(productSchema.partial()), ProductController.updateProduct);

// New: Image Upload and Bulk Upload
router.post('/upload-image', authenticateToken, requireAdmin, validateCsrf, uploadImage.single('image'), ProductController.uploadImage);
router.post('/bulk-upload', authenticateToken, requireAdmin, validateCsrf, uploadCatalogue.single('file'), ProductController.bulkUpload);
router.delete('/:id', authenticateToken, requireAdmin, validateCsrf, ProductController.deleteProduct);

export default router;
