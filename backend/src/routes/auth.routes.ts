import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../types/schemas';
import { authenticateToken } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

// Public auth routes (no CSRF needed — these establish the session)
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/verify-email', AuthController.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/refresh', AuthController.refreshToken);
if (process.env.NODE_ENV !== 'production') {
  router.all('/dev-verify', AuthController.devVerify);
}

// Authenticated routes — require valid session cookie + CSRF token
router.post('/change-password', authenticateToken, validateCsrf, AuthController.changePassword);
router.post('/logout', AuthController.logout);

export default router;
