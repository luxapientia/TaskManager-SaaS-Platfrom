const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt');
const logger = require('../utils/logger');

async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    const user = await userService.register({ email, password, name });

    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await userService.login({ email, password });

    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      message: 'Login successful',
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await userService.getUserById(decoded.userId);

    const newToken = generateToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

async function getMe(req, res) {
  try {
    res.json({ user: req.user });
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  register,
  login,
  refresh,
  getMe,
};
