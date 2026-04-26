import express from 'express';
import {
  createSubmission,
  getSubmissionsByUser,
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Ambassador routes
router.post('/create', upload.single('proofImage'), createSubmission);
router.get('/user/:id', getSubmissionsByUser);

// Admin only routes
router.get('/all', adminOnly, getAllSubmissions);
router.put('/approve/:id', adminOnly, approveSubmission);
router.put('/reject/:id', adminOnly, rejectSubmission);

export default router;
