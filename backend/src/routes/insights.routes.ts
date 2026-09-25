import { Router } from 'express';
import * as Insights from '../controllers/insights.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

// Admin-only dashboard data. Mounted outside the public support/corporate
// routers so the admin isn't throttled by their 10-requests-per-hour limiter.
const router = Router();

router.use(authenticateToken, requireAdmin);
router.get('/summary', Insights.getSummary);
router.get('/tickets', Insights.listTickets);
router.patch('/tickets/:id/status', validateCsrf, Insights.updateTicketStatus);
router.get('/inquiries', Insights.listInquiries);
router.patch('/inquiries/:id/status', validateCsrf, Insights.updateInquiryStatus);

export default router;
