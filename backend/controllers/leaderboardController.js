import User from '../models/User.js';

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;

    // Get ambassadors sorted by points
    const users = await User.find({ role: 'ambassador' })
      .select('name college points badges streakDays tasksCompleted')
      .populate('badges', 'title icon tier')
      .sort({ points: -1, tasksCompleted: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      _id: user._id,
      name: user.name,
      college: user.college,
      points: user.points,
      badges: user.badges,
      streakDays: user.streakDays,
      tasksCompleted: user.tasksCompleted,
    }));

    const total = await User.countDocuments({ role: 'ambassador' });

    res.json({
      success: true,
      data: leaderboard,
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

// @desc    Get user rank
// @route   GET /api/leaderboard/rank/:userId
// @access  Private
export const getUserRank = async (req, res) => {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Count users with more points
    const usersAbove = await User.countDocuments({
      role: 'ambassador',
      points: { $gt: user.points },
    });

    const rank = usersAbove + 1;

    // Get total ambassadors
    const totalAmbassadors = await User.countDocuments({ role: 'ambassador' });

    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        rank,
        totalAmbassadors,
        percentile: Math.round(((totalAmbassadors - rank + 1) / totalAmbassadors) * 100),
        points: user.points,
        tasksCompleted: user.tasksCompleted,
        streakDays: user.streakDays,
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

// @desc    Get top performers by college
// @route   GET /api/leaderboard/college/:college
// @access  Private
export const getCollegeLeaderboard = async (req, res) => {
  try {
    const { college } = req.params;
    const { limit = 10 } = req.query;

    const users = await User.find({
      role: 'ambassador',
      college: { $regex: new RegExp(college, 'i') },
    })
      .select('name college points badges streakDays tasksCompleted')
      .populate('badges', 'title icon tier')
      .sort({ points: -1 })
      .limit(parseInt(limit));

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      college: user.college,
      points: user.points,
      badges: user.badges,
      streakDays: user.streakDays,
      tasksCompleted: user.tasksCompleted,
    }));

    res.json({
      success: true,
      data: leaderboard,
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
