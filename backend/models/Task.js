import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a task description'],
    },
    deadline: {
      type: Date,
      required: [true, 'Please add a deadline'],
    },
    points: {
      type: Number,
      required: [true, 'Please specify points for the task'],
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isGlobal: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'cancelled'],
      default: 'active',
    },
    category: {
      type: String,
      enum: ['social-media', 'event', 'content', 'referral', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
taskSchema.index({ status: 1, deadline: 1 });
taskSchema.index({ assignedTo: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
