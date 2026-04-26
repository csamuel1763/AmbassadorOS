import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a badge title'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a badge description'],
    },
    icon: {
      type: String,
      default: 'badge-default',
    },
    pointsRequired: {
      type: Number,
      default: 0,
    },
    tasksRequired: {
      type: Number,
      default: 0,
    },
    streakRequired: {
      type: Number,
      default: 0,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'elite'],
      default: 'bronze',
    },
  },
  {
    timestamps: true,
  }
);

const Badge = mongoose.model('Badge', badgeSchema);

export default Badge;
