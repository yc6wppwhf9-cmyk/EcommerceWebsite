import { Router } from 'express';
import { getSetting, upsertSetting } from '../controllers/settings.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

// Public read — any client can fetch settings
router.get('/:key', getSetting);

// Admin-only write
router.put('/:key', authenticateToken, requireAdmin, validateCsrf, upsertSetting);

export default router;
