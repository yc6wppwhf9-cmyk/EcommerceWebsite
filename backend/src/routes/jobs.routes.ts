import { Router } from 'express';
import * as JobsController from '../controllers/jobs.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

// Public: list open jobs + single job
router.get('/', JobsController.getJobs);
router.get('/applications', authenticateToken, requireAdmin, JobsController.getAllApplications);
router.get('/:id', JobsController.getJobById);

// Admin: create / update / delete jobs
router.post('/', authenticateToken, requireAdmin, validateCsrf, JobsController.createJob);
router.put('/:id', authenticateToken, requireAdmin, validateCsrf, JobsController.updateJob);
router.delete('/:id', authenticateToken, requireAdmin, validateCsrf, JobsController.deleteJob);

// Applications: anyone can apply (no auth required for public applicants)
router.post('/:jobId/apply', JobsController.submitApplication);
router.get('/:jobId/applications', authenticateToken, requireAdmin, JobsController.getJobApplications);
router.patch('/applications/:appId/status', authenticateToken, requireAdmin, validateCsrf, JobsController.updateApplicationStatus);

export default router;
