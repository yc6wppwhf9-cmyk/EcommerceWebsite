import { Router } from 'express';
import { chat, getChatLogs, getChatAnalytics, deleteChatLog } from '../controllers/chat.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

// Public chat interaction
router.post('/', chat);

// Admin-only Chat Analytics & Logs
router.get('/logs', authenticateToken, requireAdmin, getChatLogs);
router.get('/analytics', authenticateToken, requireAdmin, getChatAnalytics);
router.delete('/logs/:id', authenticateToken, requireAdmin, validateCsrf, deleteChatLog);

export default router;
