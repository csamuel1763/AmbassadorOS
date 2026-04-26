/**
 * Point Calculator Utility
 * Handles all point calculations for the ambassador system
 */

// Calculate base points for a submission
export const calculateSubmissionPoints = (taskPoints, aiScore = null) => {
  let points = taskPoints;

  // Bonus based on AI score (if available)
  if (aiScore !== null) {
    if (aiScore >= 90) {
      points = Math.round(points * 1.2); // 20% bonus for excellent submissions
    } else if (aiScore >= 75) {
      points = Math.round(points * 1.1); // 10% bonus for good submissions
    } else if (aiScore < 50) {
      points = Math.round(points * 0.8); // 20% reduction for poor quality
    }
  }

  return points;
};

// Calculate streak bonus points
export const calculateStreakBonus = (streakDays) => {
  if (streakDays >= 30) {
    return 100; // Monthly streak bonus
  } else if (streakDays >= 14) {
    return 50; // Bi-weekly streak bonus
  } else if (streakDays >= 7) {
    return 25; // Weekly streak bonus
  } else if (streakDays >= 3) {
    return 10; // 3-day streak bonus
  }
  return 0;
};

// Calculate badge reward points
export const calculateBadgeRewardPoints = (badgeTier) => {
  const tierPoints = {
    bronze: 50,
    silver: 100,
    gold: 200,
    elite: 500,
  };

  return tierPoints[badgeTier] || 0;
};

// Calculate total points for a submission approval
export const calculateTotalPoints = (taskPoints, aiScore, streakDays) => {
  const basePoints = calculateSubmissionPoints(taskPoints, aiScore);
  const streakBonus = calculateStreakBonus(streakDays);

  return basePoints + streakBonus;
};

// Update user streak
export const updateStreak = (lastActivityDate) => {
  const now = new Date();
  const lastActivity = new Date(lastActivityDate);
  const diffTime = Math.abs(now - lastActivity);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return 'increment'; // Continue streak
  } else if (diffDays === 0) {
    return 'maintain'; // Same day, maintain streak
  } else {
    return 'reset'; // Streak broken
  }
};

// Check badge eligibility
export const checkBadgeEligibility = (user, badges) => {
  const eligibleBadges = [];

  for (const badge of badges) {
    const hasPoints = user.points >= badge.pointsRequired;
    const hasTasks =
      badge.tasksRequired === 0 || user.tasksCompleted >= badge.tasksRequired;
    const hasStreak =
      badge.streakRequired === 0 || user.streakDays >= badge.streakRequired;
    const alreadyHas = user.badges.some(
      (b) => b.toString() === badge._id.toString()
    );

    if (hasPoints && hasTasks && hasStreak && !alreadyHas) {
      eligibleBadges.push(badge);
    }
  }

  return eligibleBadges;
};
