import Submission from '../models/Submission.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import { evaluateSubmission } from '../services/aiService.js';
import {
  calculateTotalPoints,
  updateStreak,
  checkBadgeEligibility,
  calculateBadgeRewardPoints,
} from '../utils/pointCalculator.js';

// @desc    Create new submission
// @route   POST /api/submissions/create
// @access  Private
export const createSubmission = async (req, res) => {
  try {
    const { taskId, proofText } = req.body;

    // Check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check if user already submitted for this task
    const existingSubmission = await Submission.findOne({
      userId: req.user._id,
      taskId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted for this task',
      });
    }

    // Get AI evaluation
    const aiResult = await evaluateSubmission(proofText, task.description);

    // Create submission
    const submission = await Submission.create({
      userId: req.user._id,
      taskId,
      proofText,
      proofImage: req.file ? req.file.path : null,
      aiScore: aiResult.score,
      aiAnalysis: aiResult.analysis,
    });

    // Update user's last activity date
    await User.findByIdAndUpdate(req.user._id, {
      lastActivityDate: new Date(),
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get submissions by user ID
// @route   GET /api/submissions/user/:id
// @access  Private
export const getSubmissionsByUser = async (req, res) => {
  try {
    const userId = req.params.id === 'me' ? req.user._id : req.params.id;

    // Only allow users to see their own submissions or admins to see any
    if (req.user.role !== 'admin' && userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const submissions = await Submission.find({ userId })
      .populate('taskId', 'title points category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all submissions
// @route   GET /api/submissions/all
// @access  Private/Admin
export const getAllSubmissions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate('userId', 'name email college')
      .populate('taskId', 'title points category')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      data: submissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Approve submission
// @route   PUT /api/submissions/approve/:id
// @access  Private/Admin
export const approveSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Submission has already been reviewed',
      });
    }

    // Get task for points
    const task = await Task.findById(submission.taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Associated task not found',
      });
    }

    // Get user
    const user = await User.findById(submission.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update streak
    const streakAction = updateStreak(user.lastActivityDate);
    if (streakAction === 'increment') {
      user.streakDays += 1;
    } else if (streakAction === 'reset') {
      user.streakDays = 1;
    }

    // Calculate points
    const pointsEarned = calculateTotalPoints(
      task.points,
      submission.aiScore,
      user.streakDays
    );

    // Update user stats
    user.points += pointsEarned;
    user.tasksCompleted += 1;
    user.lastActivityDate = new Date();

    // Check for new badges
    const allBadges = await Badge.find();
    const newBadges = checkBadgeEligibility(user, allBadges);

    // Award new badges
    for (const badge of newBadges) {
      user.badges.push(badge._id);
      user.points += calculateBadgeRewardPoints(badge.tier);
    }

    await user.save();

    // Update submission
    submission.status = 'approved';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    res.json({
      success: true,
      data: {
        submission,
        pointsEarned,
        newBadges: newBadges.map((b) => b.title),
        userStats: {
          totalPoints: user.points,
          tasksCompleted: user.tasksCompleted,
          streakDays: user.streakDays,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Reject submission
// @route   PUT /api/submissions/reject/:id
// @access  Private/Admin
export const rejectSubmission = async (req, res) => {
  try {
    const { reason } = req.body;

    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Submission has already been reviewed',
      });
    }

    submission.status = 'rejected';
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    submission.rejectionReason = reason || 'Submission did not meet requirements';

    await submission.save();

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
