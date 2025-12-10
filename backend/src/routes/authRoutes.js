const express = require('express');
const authController = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
} = require('../validators/authValidator');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidator, authController.register);
router.post('/login', loginValidator, authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.getMe);
router.put(
  '/profile',
  authenticate,
  updateProfileValidator,
  authController.updateProfile
);

module.exports = router;

