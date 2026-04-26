import express from 'express';
import {
  suggestTask,
  evaluateSubmissionAI,
  getDropoutRisk,
  getTopPerformerPredictions,
  getBulkDropoutRisks,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by all authenticated users
router.get('/suggest-task/:userId', suggestTask);
router.post('/evaluate-submission', evaluateSubmissionAI);

// Admin only routes
router.get('/dropout-risk/:userId', adminOnly, getDropoutRisk);
router.get('/dropout-risks', adminOnly, getBulkDropoutRisks);
router.get('/top-performers', adminOnly, getTopPerformerPredictions);

export default router;
