import { Router } from 'express';
import { getSetting, upsertSetting } from '../controllers/settings.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public read — any client can fetch settings
router.get('/:key', getSetting);

// Admin-only write
router.put('/:key', authenticateToken, upsertSetting);

export default router;
