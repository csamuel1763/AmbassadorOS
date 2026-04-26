AmbassadorOS – AI-Powered Campus Ambassador Management Platform
 Project Overview

AmbassadorOS is an AI-powered web platform designed to help organizations efficiently manage campus ambassador programs by automating task assignment, submission verification, performance tracking, leaderboard ranking, and engagement analytics.

Traditional campus ambassador programs rely heavily on WhatsApp groups, spreadsheets, and manual tracking systems, which leads to inefficiency, lack of transparency, and reduced engagement. AmbassadorOS solves this problem by providing a centralized digital ecosystem powered by intelligent automation and analytics.

The platform supports two types of users:

Admin (Organization)
Campus Ambassador (Student)

Admins can assign tasks, review submissions, monitor performance, and analyze engagement metrics, while ambassadors can complete activities, earn rewards, and track their progress in real time.

Problem Statement

Organizations managing campus ambassador programs face challenges such as:

No centralized system for task management
Manual verification of submissions
Lack of performance analytics
Difficulty identifying top performers
No engagement tracking system
Low ambassador motivation due to missing rewards structure

AmbassadorOS addresses these challenges through automation, gamification, and AI-powered insights.

Solution

AmbassadorOS provides a smart platform where:

admins create and assign promotional tasks
ambassadors submit proof of completion
submissions are evaluated automatically
leaderboard updates dynamically
badges are awarded based on achievements
AI recommends next best tasks
engagement analytics predict performance trends

This creates a transparent and motivating ecosystem for both organizations and students.

Key Features
Authentication System

Secure login and registration system using JWT authentication with role-based access control:

Admin login
Ambassador login
Protected routes
Password encryption using bcrypt
Task Management System

Admins can:

create tasks
assign deadlines
define reward points
distribute tasks globally or individually

Ambassadors can:

view assigned tasks
track deadlines
submit completion proof
Submission Verification System

Ambassadors upload:

screenshots
referral links
activity descriptions

Admins can:

approve submissions
reject submissions
review proof instantly

Approved submissions automatically increase ambassador points.

Leaderboard System

Dynamic leaderboard ranks ambassadors based on:

completed tasks
earned points
engagement consistency

Leaderboard includes:

rank
ambassador name
college
badge level
total points

This introduces healthy competition and improves participation.

Badge & Reward Engine

Gamification improves ambassador motivation through milestone achievements:

Example badges:

Bronze Ambassador
Silver Promoter
Gold Leader
Elite Champion

Badges are awarded automatically based on:

total points
streak consistency
task completion milestones
📊 Analytics Dashboard (Admin)

Admin dashboard displays real-time program insights:

total ambassadors
active ambassadors
completed tasks
weekly engagement rate
participation trends
leaderboard growth visualization

This helps organizations measure ROI effectively.

AI-Powered Task Recommendation System

The platform uses AI to recommend personalized next actions for ambassadors based on:

previous activity
completion rate
engagement level
earned points

Example output:

“Promote the upcoming webinar on Instagram to increase your leaderboard rank.”

This improves productivity and retention.

🤖 AI Submission Evaluation

Uploaded task proofs are analyzed automatically using AI to estimate submission quality and assign performance scores.

Benefits:

reduces manual verification workload
speeds up approval process
improves evaluation consistency
Dropout Risk Detection

AI identifies inactive ambassadors by analyzing:

submission frequency
last activity timestamp
streak interruptions

Risk levels returned:

Low
Medium
High

Admins can intervene early to improve retention.

Top Performer Prediction

Machine learning logic predicts future leaderboard leaders based on:

participation consistency
points growth trend
submission activity

Helps organizations identify strong candidates for internships or leadership roles.

System Architecture

The platform follows a modular full-stack architecture:

Frontend → Backend → Database → AI Engine
Components

Frontend:

React.js + Tailwind CSS

Backend:

Node.js + Express.js

Database:

MongoDB Atlas

AI Integration:

OpenAI API

Authentication:

JWT + bcrypt

 Project Structure
backend/
 ├── config/
 ├── controllers/
 ├── middleware/
 ├── models/
 ├── routes/
 ├── services/
 ├── utils/
 └── server.js

frontend/
 ├── components/
 ├── pages/
 ├── layout/
 ├── hooks/
 ├── services/
 └── utils/
Database Schema Overview
User Collection

Stores:

name
email
role
college
points
badges
streakDays
tasksCompleted
Task Collection

Stores:

task title
description
deadline
reward points
assigned ambassadors
Submission Collection

Stores:

ambassador ID
task ID
proof text
proof image
approval status
AI evaluation score
Badge Collection

Stores:

badge name
description
icon
points threshold
🔗 API Endpoints
Authentication
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile
Tasks
POST /api/tasks/create
GET /api/tasks/all
PUT /api/tasks/update/:id
DELETE /api/tasks/delete/:id
Submissions
POST /api/submissions/create
PUT /api/submissions/approve/:id
PUT /api/submissions/reject/:id
Leaderboard
GET /api/leaderboard
Analytics
GET /api/analytics/summary
GET /api/analytics/trends
AI Features
GET /api/ai/suggest-task/:userId
POST /api/ai/evaluate-submission
GET /api/ai/dropout-risk/:userId
GET /api/ai/top-performers
Installation Guide

Clone repository:

git clone <repo-link>

Install backend dependencies:

cd backend
npm install

Install frontend dependencies:

cd frontend
npm install

Create environment file:

PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_api_key

Run backend:

npm start

Run frontend:

npm start
Future Enhancements

Planned improvements include:

mobile app version
WhatsApp notification bot
referral tracking system
campus-wise performance analytics
certificate auto-generation
internship recommendation engine
Author

Developed by:

Samuel Godson
Karunya Institute of Technology and Sciences

Focused on building intelligent systems for real-world automation and productivity improvement.
