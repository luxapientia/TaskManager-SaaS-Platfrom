const taskService = require('../services/taskService');
const logger = require('../utils/logger');

const createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body, req.user.id);
    res.status(201).json({
      message: 'Task created successfully',
      task: task.toJSON(),
    });
  } catch (error) {
    logger.error('Error creating task:', error);
    if (error.message === 'User not found' || error.message === 'Assigned user not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTasks = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      assigned_to: req.query.assigned_to,
      priority: req.query.priority,
    };

    // Remove undefined filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const tasks = await taskService.getTasks(req.user.id, filters);
    res.json({
      message: 'Tasks retrieved successfully',
      tasks: tasks.map((task) => task.toJSON()),
    });
  } catch (error) {
    logger.error('Error getting tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    res.json({
      message: 'Task retrieved successfully',
      task: task.toJSON(),
    });
  } catch (error) {
    logger.error('Error getting task:', error);
    if (error.message === 'Task not found' || error.message === 'Unauthorized to access this task') {
      return res.status(error.message === 'Task not found' ? 404 : 403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
    res.json({
      message: 'Task updated successfully',
      task: task.toJSON(),
    });
  } catch (error) {
    logger.error('Error updating task:', error);
    if (
      error.message === 'Task not found' ||
      error.message === 'Unauthorized to update this task' ||
      error.message === 'Only task owner can assign tasks' ||
      error.message === 'Assigned user not found'
    ) {
      return res.status(
        error.message === 'Task not found' ? 404 : error.message.includes('Unauthorized') || error.message.includes('Only task owner') ? 403 : 404
      ).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id);
    res.json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting task:', error);
    if (error.message === 'Task not found' || error.message === 'Unauthorized to delete this task') {
      return res.status(error.message === 'Task not found' ? 404 : 403).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};

