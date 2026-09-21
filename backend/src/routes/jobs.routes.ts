import { Router } from 'express';
import multer from 'multer';
import * as JobsController from '../controllers/jobs.controller';
import { authenticateToken, requireAdminOrHR } from '../middleware/auth';
import { validateCsrf } from '../middleware/csrf';

const router = Router();

// Public resume upload — memory storage, 5MB cap, PDF/DOC/image only.
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /pdf|msword|officedocument|image\//.test(file.mimetype);
    cb(ok ? null : new Error('Only PDF, DOC, or image resumes are allowed'), ok);
  },
});
router.post('/upload-resume', resumeUpload.single('resume'), JobsController.uploadResume);

// Public: list open jobs + single job
router.get('/', JobsController.getJobs);
router.get('/applications', authenticateToken, requireAdminOrHR, JobsController.getAllApplications);
router.get('/:id', JobsController.getJobById);

// Admin / HR: create / update / delete jobs
router.post('/', authenticateToken, requireAdminOrHR, validateCsrf, JobsController.createJob);
router.put('/:id', authenticateToken, requireAdminOrHR, validateCsrf, JobsController.updateJob);
router.delete('/:id', authenticateToken, requireAdminOrHR, validateCsrf, JobsController.deleteJob);

// Applications: anyone can apply (no auth required for public applicants)
router.post('/:jobId/apply', JobsController.submitApplication);
router.get('/:jobId/applications', authenticateToken, requireAdminOrHR, JobsController.getJobApplications);
router.patch('/applications/:appId/status', authenticateToken, requireAdminOrHR, validateCsrf, JobsController.updateApplicationStatus);
router.delete('/applications/:appId', authenticateToken, requireAdminOrHR, validateCsrf, JobsController.deleteApplication);

export default router;
