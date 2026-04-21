import { Router } from 'express';
import { getSetting, upsertSetting } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public read — any client can fetch settings
router.get('/:key', getSetting);

// Admin-only write
router.put('/:key', authenticate, upsertSetting);

export default router;
