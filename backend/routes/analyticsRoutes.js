import express from 'express';
import {
  getSummary,
  getTrends,
  getCollegeAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(adminOnly);

router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/colleges', getCollegeAnalytics);

export default router;
