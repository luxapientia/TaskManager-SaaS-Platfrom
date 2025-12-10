const User = require('../models/User');
const logger = require('../utils/logger');

class UserService {
  async register({ email, password, name }) {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = await User.create({ email, password, name });
    return user.toJSON();
  }

  async login({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    logger.info(`User logged in: ${user.email}`);
    return user.toJSON();
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user.toJSON();
  }

  async updateProfile(userId, updates) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updates.email && updates.email !== user.email) {
      const existingUser = await User.findByEmail(updates.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    const updatedUser = await user.update(updates);
    return updatedUser.toJSON();
  }
}

module.exports = new UserService();

