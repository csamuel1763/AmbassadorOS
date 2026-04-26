import express from 'express';
import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.post('/create', adminOnly, createTask);
router.put('/update/:id', adminOnly, updateTask);
router.delete('/delete/:id', adminOnly, deleteTask);

// All authenticated users
router.get('/all', getAllTasks);
router.get('/:id', getTaskById);

export default router;
