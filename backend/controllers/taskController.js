import Task from '../models/Task.js';

// @desc    Create new task
// @route   POST /api/tasks/create
// @access  Private/Admin
export const createTask = async (req, res) => {
  try {
    const { title, description, deadline, points, assignedTo, isGlobal, category } = req.body;

    const task = await Task.create({
      title,
      description,
      deadline,
      points,
      createdBy: req.user._id,
      assignedTo: isGlobal ? [] : assignedTo || [],
      isGlobal: isGlobal || false,
      category: category || 'other',
    });

    res.status(201).json({
      success: true,
      data: task,
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

// @desc    Get all tasks
// @route   GET /api/tasks/all
// @access  Private
export const getAllTasks = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // For ambassadors, show global tasks or tasks assigned to them
    if (req.user.role === 'ambassador') {
      query.$or = [
        { isGlobal: true },
        { assignedTo: req.user._id }
      ];
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: tasks,
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

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.json({
      success: true,
      data: task,
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

// @desc    Update task
// @route   PUT /api/tasks/update/:id
// @access  Private/Admin
export const updateTask = async (req, res) => {
  try {
    const { title, description, deadline, points, assignedTo, status, isGlobal, category } = req.body;

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.deadline = deadline || task.deadline;
    task.points = points !== undefined ? points : task.points;
    task.assignedTo = assignedTo || task.assignedTo;
    task.status = status || task.status;
    task.isGlobal = isGlobal !== undefined ? isGlobal : task.isGlobal;
    task.category = category || task.category;

    const updatedTask = await task.save();

    res.json({
      success: true,
      data: updatedTask,
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

// @desc    Delete task
// @route   DELETE /api/tasks/delete/:id
// @access  Private/Admin
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully',
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
