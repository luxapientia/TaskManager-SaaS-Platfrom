const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createTaskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),
  body('due_date')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Assigned to must be a valid UUID'),
  validate,
];

const updateTaskValidator = [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Assigned to must be a valid UUID'),
  validate,
];

const getTaskValidator = [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
  validate,
];

const getTasksValidator = [
  query('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be one of: todo, in-progress, done'),
  query('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Assigned to must be a valid UUID'),
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be one of: low, medium, high'),
  validate,
];

const deleteTaskValidator = [
  param('id').isUUID().withMessage('Task ID must be a valid UUID'),
  validate,
];

module.exports = {
  createTaskValidator,
  updateTaskValidator,
  getTaskValidator,
  getTasksValidator,
  deleteTaskValidator,
};
