import { Router } from 'express';
import * as SupportController from '../controllers/support.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';
import { validate } from '../middleware/validate';
import { warrantyClaimSchema } from '../types/schemas';

const router = Router();

router.post('/warranty', validate(warrantyClaimSchema), SupportController.submitWarrantyClaim);
router.get('/status/:ticketNumber', SupportController.getPublicStatus);
router.get('/', authenticateToken, requireAdmin, SupportController.listTickets);
router.patch('/:id/status', authenticateToken, requireAdmin, validateCsrf, SupportController.updateTicketStatus);

export default router;
