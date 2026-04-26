import User from '../models/User.js';
import Task from '../models/Task.js';
import Submission from '../models/Submission.js';

// @desc    Get analytics summary
// @route   GET /api/analytics/summary
// @access  Private/Admin
export const getSummary = async (req, res) => {
  try {
    // Total ambassadors
    const totalAmbassadors = await User.countDocuments({ role: 'ambassador' });

    // Active ambassadors (activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeAmbassadors = await User.countDocuments({
      role: 'ambassador',
      lastActivityDate: { $gte: sevenDaysAgo },
    });

    // Total tasks completed (approved submissions)
    const totalTasksCompleted = await Submission.countDocuments({
      status: 'approved',
    });

    // Weekly engagement calculations
    const weeklySubmissions = await Submission.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const weeklyEngagementRate =
      totalAmbassadors > 0
        ? Math.round((activeAmbassadors / totalAmbassadors) * 100)
        : 0;

    // Pending submissions
    const pendingSubmissions = await Submission.countDocuments({
      status: 'pending',
    });

    // Active tasks
    const activeTasks = await Task.countDocuments({ status: 'active' });

    // Total points distributed
    const pointsResult = await User.aggregate([
      { $match: { role: 'ambassador' } },
      { $group: { _id: null, totalPoints: { $sum: '$points' } } },
    ]);
    const totalPointsDistributed = pointsResult[0]?.totalPoints || 0;

    res.json({
      success: true,
      data: {
        totalAmbassadors,
        activeAmbassadors,
        inactiveAmbassadors: totalAmbassadors - activeAmbassadors,
        totalTasksCompleted,
        weeklyEngagementRate,
        weeklySubmissions,
        pendingSubmissions,
        activeTasks,
        totalPointsDistributed,
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

// @desc    Get analytics trends
// @route   GET /api/analytics/trends
// @access  Private/Admin
export const getTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Task completion trend (daily)
    const taskCompletionTrend = await Submission.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // New registrations trend
    const registrationTrend = await User.aggregate([
      {
        $match: {
          role: 'ambassador',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Points distribution trend
    const pointsTrend = await Submission.aggregate([
      {
        $match: {
          status: 'approved',
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'task',
        },
      },
      { $unwind: '$task' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalPoints: { $sum: '$task.points' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Weekly participation stats
    const weeklyStats = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const submissions = await Submission.countDocuments({
        createdAt: { $gte: weekStart, $lt: weekEnd },
      });

      const activeUsers = await User.countDocuments({
        role: 'ambassador',
        lastActivityDate: { $gte: weekStart, $lt: weekEnd },
      });

      weeklyStats.unshift({
        week: `Week ${4 - i}`,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        submissions,
        activeUsers,
      });
    }

    // Category distribution
    const categoryDistribution = await Submission.aggregate([
      { $match: { status: 'approved' } },
      {
        $lookup: {
          from: 'tasks',
          localField: 'taskId',
          foreignField: '_id',
          as: 'task',
        },
      },
      { $unwind: '$task' },
      {
        $group: {
          _id: '$task.category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        taskCompletionTrend,
        registrationTrend,
        pointsTrend,
        weeklyStats,
        categoryDistribution,
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

// @desc    Get college-wise analytics
// @route   GET /api/analytics/colleges
// @access  Private/Admin
export const getCollegeAnalytics = async (req, res) => {
  try {
    const collegeStats = await User.aggregate([
      { $match: { role: 'ambassador' } },
      {
        $group: {
          _id: '$college',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' },
          avgPoints: { $avg: '$points' },
          totalTasksCompleted: { $sum: '$tasksCompleted' },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: collegeStats,
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
