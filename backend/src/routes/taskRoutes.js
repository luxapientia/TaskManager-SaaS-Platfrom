const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const {
  createTaskValidator,
  updateTaskValidator,
  getTaskValidator,
  getTasksValidator,
  deleteTaskValidator,
} = require('../validators/taskValidator');

// All task routes require authentication
router.use(authenticate);

// Create a new task
router.post('/', createTaskValidator, taskController.createTask);

// Get all tasks for the authenticated user
router.get('/', getTasksValidator, taskController.getTasks);

// Get a specific task by ID
router.get('/:id', getTaskValidator, taskController.getTask);

// Update a task
router.put('/:id', updateTaskValidator, taskController.updateTask);

// Delete a task
router.delete('/:id', deleteTaskValidator, taskController.deleteTask);

module.exports = router;
