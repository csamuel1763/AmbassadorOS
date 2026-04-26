import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Badge from '../models/Badge.js';

dotenv.config();

const badges = [
  {
    title: 'Bronze Ambassador',
    description: 'Welcome to the ambassador program! Complete your first task.',
    icon: 'badge-bronze',
    pointsRequired: 0,
    tasksRequired: 1,
    streakRequired: 0,
    tier: 'bronze',
  },
  {
    title: 'Silver Promoter',
    description: 'You are making progress! Keep up the great work.',
    icon: 'badge-silver',
    pointsRequired: 500,
    tasksRequired: 10,
    streakRequired: 0,
    tier: 'silver',
  },
  {
    title: 'Gold Leader',
    description: 'You are a top performer in the ambassador program!',
    icon: 'badge-gold',
    pointsRequired: 2000,
    tasksRequired: 25,
    streakRequired: 7,
    tier: 'gold',
  },
  {
    title: 'Elite Champion',
    description: 'The highest honor in the ambassador program. True dedication!',
    icon: 'badge-elite',
    pointsRequired: 5000,
    tasksRequired: 50,
    streakRequired: 14,
    tier: 'elite',
  },
  {
    title: 'Streak Master',
    description: 'Maintained a 30-day activity streak. Incredible consistency!',
    icon: 'badge-streak',
    pointsRequired: 0,
    tasksRequired: 0,
    streakRequired: 30,
    tier: 'gold',
  },
  {
    title: 'Social Media Star',
    description: 'Completed 20 social media tasks. You are a digital marketing pro!',
    icon: 'badge-social',
    pointsRequired: 1000,
    tasksRequired: 20,
    streakRequired: 0,
    tier: 'silver',
  },
];

const seedBadges = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing badges
    await Badge.deleteMany({});
    console.log('Cleared existing badges');

    // Insert new badges
    await Badge.insertMany(badges);
    console.log('Badges seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding badges:', error);
    process.exit(1);
  }
};

seedBadges();
