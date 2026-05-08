import { Router } from 'express';
import * as UserController from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

// All user routes require authentication
router.get('/me', authenticateToken, UserController.getMe);
router.put('/me', authenticateToken, validateCsrf, UserController.updateMe);

router.get('/me/addresses', authenticateToken, UserController.getAddresses);
router.post('/me/addresses', authenticateToken, validateCsrf, UserController.addAddress);
router.delete('/me/addresses/:id', authenticateToken, validateCsrf, UserController.deleteAddress);

export default router;
