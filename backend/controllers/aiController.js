import User from '../models/User.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';
import {
  evaluateSubmission,
  recommendTask,
  assessDropoutRisk,
  predictTopPerformers,
} from '../services/aiService.js';

// @desc    Get AI task recommendation for user
// @route   GET /api/ai/suggest-task/:userId
// @access  Private
export const suggestTask = async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    // Only allow users to get suggestions for themselves or admins for any user
    if (req.user.role !== 'admin' && userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get completed tasks by user
    const completedSubmissions = await Submission.find({
      userId,
      status: 'approved',
    }).select('taskId');

    const completedTaskIds = completedSubmissions.map((s) => s.taskId.toString());

    // Get available tasks (not completed by user)
    const availableTasks = await Task.find({
      status: 'active',
      _id: { $nin: completedTaskIds },
      $or: [{ isGlobal: true }, { assignedTo: userId }],
      deadline: { $gte: new Date() },
    });

    if (availableTasks.length === 0) {
      return res.json({
        success: true,
        data: {
          recommendation: null,
          message: 'No available tasks at the moment',
        },
      });
    }

    // Get AI recommendation
    const aiRecommendation = await recommendTask(
      user,
      availableTasks,
      completedSubmissions
    );

    // Find the recommended task
    const recommendedTask = availableTasks.find(
      (t) => t._id.toString() === aiRecommendation.recommendedTaskId
    );

    res.json({
      success: true,
      data: {
        recommendation: recommendedTask,
        reason: aiRecommendation.reason,
        alternativeTasks: availableTasks
          .filter((t) => t._id.toString() !== aiRecommendation.recommendedTaskId)
          .slice(0, 3),
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

// @desc    Evaluate submission with AI
// @route   POST /api/ai/evaluate-submission
// @access  Private
export const evaluateSubmissionAI = async (req, res) => {
  try {
    const { proofText, taskDescription } = req.body;

    if (!proofText || !taskDescription) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both proofText and taskDescription',
      });
    }

    const result = await evaluateSubmission(proofText, taskDescription);

    res.json({
      success: true,
      data: result,
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

// @desc    Get dropout risk for user
// @route   GET /api/ai/dropout-risk/:userId
// @access  Private/Admin
export const getDropoutRisk = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's submissions
    const submissions = await Submission.find({ userId: req.params.userId });

    const riskAssessment = await assessDropoutRisk(user, submissions);

    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        ...riskAssessment,
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

// @desc    Get top performer predictions
// @route   GET /api/ai/top-performers
// @access  Private/Admin
export const getTopPerformerPredictions = async (req, res) => {
  try {
    // Get all active ambassadors
    const users = await User.find({
      role: 'ambassador',
      lastActivityDate: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    })
      .select('name points tasksCompleted streakDays lastActivityDate')
      .limit(100);

    if (users.length === 0) {
      return res.json({
        success: true,
        data: {
          predictions: [],
          message: 'No active ambassadors found',
        },
      });
    }

    const predictions = await predictTopPerformers(users);

    // Enrich predictions with user data
    const enrichedPredictions = predictions.predictions.map((pred) => {
      const user = users.find((u) => u._id.toString() === pred.userId.toString());
      return {
        ...pred,
        userName: user?.name || 'Unknown',
        currentPoints: user?.points || 0,
        currentTasksCompleted: user?.tasksCompleted || 0,
      };
    });

    res.json({
      success: true,
      data: {
        predictions: enrichedPredictions,
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

// @desc    Bulk analyze dropout risks
// @route   GET /api/ai/dropout-risks
// @access  Private/Admin
export const getBulkDropoutRisks = async (req, res) => {
  try {
    const { riskLevel } = req.query;

    // Get all ambassadors
    const users = await User.find({ role: 'ambassador' });

    const results = [];

    for (const user of users) {
      const submissions = await Submission.find({ userId: user._id });
      const riskAssessment = await assessDropoutRisk(user, submissions);

      if (!riskLevel || riskAssessment.riskLevel === riskLevel) {
        results.push({
          userId: user._id,
          name: user.name,
          email: user.email,
          college: user.college,
          ...riskAssessment,
        });
      }
    }

    // Sort by risk level (High first)
    const riskOrder = { High: 0, Medium: 1, Low: 2 };
    results.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

    res.json({
      success: true,
      data: results,
      summary: {
        high: results.filter((r) => r.riskLevel === 'High').length,
        medium: results.filter((r) => r.riskLevel === 'Medium').length,
        low: results.filter((r) => r.riskLevel === 'Low').length,
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
