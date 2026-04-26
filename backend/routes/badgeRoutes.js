import express from 'express';
import Badge from '../models/Badge.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find().sort({ pointsRequired: 1 });
    res.json({
      success: true,
      data: badges,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Create badge (admin only)
router.post('/create', adminOnly, async (req, res) => {
  try {
    const { title, description, icon, pointsRequired, tasksRequired, streakRequired, tier } = req.body;

    const badge = await Badge.create({
      title,
      description,
      icon,
      pointsRequired: pointsRequired || 0,
      tasksRequired: tasksRequired || 0,
      streakRequired: streakRequired || 0,
      tier: tier || 'bronze',
    });

    res.status(201).json({
      success: true,
      data: badge,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Update badge (admin only)
router.put('/update/:id', adminOnly, async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found',
      });
    }

    res.json({
      success: true,
      data: badge,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Delete badge (admin only)
router.delete('/delete/:id', adminOnly, async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Badge not found',
      });
    }

    res.json({
      success: true,
      message: 'Badge deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

export default router;
