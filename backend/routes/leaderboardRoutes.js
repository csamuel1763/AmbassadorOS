import express from 'express';
import {
  getLeaderboard,
  getUserRank,
  getCollegeLeaderboard,
} from '../controllers/leaderboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getLeaderboard);
router.get('/rank/:userId', getUserRank);
router.get('/college/:college', getCollegeLeaderboard);

export default router;
