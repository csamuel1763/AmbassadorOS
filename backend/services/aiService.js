import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * AI Service for AmbassadorOS
 * Handles all AI-powered features using OpenAI API
 */

// Evaluate submission quality and generate AI score
export const evaluateSubmission = async (proofText, taskDescription) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI evaluator for a campus ambassador program. 
          Evaluate submission proof texts based on quality, relevance, and effort.
          Provide a score from 0-100 and a brief analysis.
          Return your response in JSON format: {"score": number, "analysis": "string"}`,
        },
        {
          role: 'user',
          content: `Task Description: ${taskDescription}
          
          Submission Proof: ${proofText}
          
          Evaluate this submission and provide a quality score (0-100) with analysis.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return {
      score: Math.min(100, Math.max(0, result.score)),
      analysis: result.analysis,
    };
  } catch (error) {
    console.error('AI Evaluation Error:', error);
    return {
      score: null,
      analysis: 'AI evaluation unavailable',
    };
  }
};

// Recommend next task based on user performance
export const recommendTask = async (user, availableTasks, completedTasks) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI task recommendation engine for a campus ambassador program.
          Based on user performance and history, recommend the most suitable next task.
          Consider points, activity level, and previous task types.
          Return your response in JSON format: {"recommendedTaskId": "string", "reason": "string"}`,
        },
        {
          role: 'user',
          content: `User Profile:
          - Points: ${user.points}
          - Tasks Completed: ${user.tasksCompleted}
          - Streak Days: ${user.streakDays}
          
          Completed Task IDs: ${completedTasks.map((t) => t.taskId).join(', ')}
          
          Available Tasks:
          ${availableTasks.map((t) => `ID: ${t._id}, Title: ${t.title}, Points: ${t.points}, Category: ${t.category}`).join('\n')}
          
          Recommend the best next task for this user.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('AI Task Recommendation Error:', error);
    return {
      recommendedTaskId: availableTasks[0]?._id || null,
      reason: 'AI recommendation unavailable. Showing first available task.',
    };
  }
};

// Assess dropout risk for a user
export const assessDropoutRisk = async (user, submissions) => {
  try {
    const now = new Date();
    const lastActivity = new Date(user.lastActivityDate);
    const daysSinceActivity = Math.ceil(
      (now - lastActivity) / (1000 * 60 * 60 * 24)
    );

    const recentSubmissions = submissions.filter((s) => {
      const subDate = new Date(s.createdAt);
      const daysDiff = Math.ceil((now - subDate) / (1000 * 60 * 60 * 24));
      return daysDiff <= 30;
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI dropout risk analyzer for a campus ambassador program.
          Analyze user activity patterns and predict dropout risk.
          Return your response in JSON format: 
          {"riskLevel": "Low" | "Medium" | "High", "confidence": number, "factors": ["string"], "recommendations": ["string"]}`,
        },
        {
          role: 'user',
          content: `User Activity Analysis:
          - Days Since Last Activity: ${daysSinceActivity}
          - Current Streak: ${user.streakDays}
          - Total Tasks Completed: ${user.tasksCompleted}
          - Total Points: ${user.points}
          - Submissions in Last 30 Days: ${recentSubmissions.length}
          
          Analyze the dropout risk for this ambassador.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 400,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('AI Dropout Risk Error:', error);
    // Fallback to simple rule-based assessment
    const daysSinceActivity = Math.ceil(
      (new Date() - new Date(user.lastActivityDate)) / (1000 * 60 * 60 * 24)
    );

    let riskLevel = 'Low';
    if (daysSinceActivity > 14) riskLevel = 'High';
    else if (daysSinceActivity > 7) riskLevel = 'Medium';

    return {
      riskLevel,
      confidence: 60,
      factors: ['Based on activity time only (AI unavailable)'],
      recommendations: ['Re-engage the ambassador with personalized tasks'],
    };
  }
};

// Predict top performers
export const predictTopPerformers = async (users) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI performance predictor for a campus ambassador program.
          Analyze user metrics and predict who will be top performers next week.
          Return your response in JSON format: 
          {"predictions": [{"userId": "string", "predictedRank": number, "confidence": number, "reasoning": "string"}]}`,
        },
        {
          role: 'user',
          content: `Ambassador Performance Data:
          ${users
            .map(
              (u) => `
            ID: ${u._id}
            Name: ${u.name}
            Current Points: ${u.points}
            Tasks Completed: ${u.tasksCompleted}
            Streak Days: ${u.streakDays}
            Days Since Last Activity: ${Math.ceil((new Date() - new Date(u.lastActivityDate)) / (1000 * 60 * 60 * 24))}
          `
            )
            .join('\n')}
          
          Predict the top 5 performers for next week.`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('AI Top Performer Prediction Error:', error);
    // Fallback to simple sorting
    const sorted = [...users]
      .sort((a, b) => b.points - a.points)
      .slice(0, 5)
      .map((u, i) => ({
        userId: u._id,
        predictedRank: i + 1,
        confidence: 50,
        reasoning: 'Based on current points (AI unavailable)',
      }));

    return { predictions: sorted };
  }
};
