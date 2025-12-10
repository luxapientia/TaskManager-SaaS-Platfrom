const Task = require('../models/Task');
const User = require('../models/User');

class TaskService {
  async createTask(taskData, userId) {
    // User is already validated by authenticate middleware
    // If assigned_to is provided, validate that user exists
    if (taskData.assigned_to) {
      const assignedUser = await User.findById(taskData.assigned_to);
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }
    }

    const task = await Task.create({
      ...taskData,
      user_id: userId,
    });

    return task;
  }

  async getTaskById(taskId, userId) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Only allow user to access their own tasks or tasks assigned to them
    if (task.user_id !== userId && task.assigned_to !== userId) {
      throw new Error('Unauthorized to access this task');
    }

    return task;
  }

  async getTasks(userId, filters = {}) {
    // Get tasks created by user
    const createdTasks = await Task.findByUserId(userId, filters);
    
    // Get tasks assigned to user
    const assignedTasks = await Task.findByAssignedTo(userId, filters);

    // Combine and deduplicate (in case a task is both created and assigned to same user)
    const taskMap = new Map();
    [...createdTasks, ...assignedTasks].forEach((task) => {
      taskMap.set(task.id, task);
    });

    return Array.from(taskMap.values());
  }

  async updateTask(taskId, updates, userId) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Only allow user to update their own tasks or tasks assigned to them
    if (task.user_id !== userId && task.assigned_to !== userId) {
      throw new Error('Unauthorized to update this task');
    }

    // Only task owner can change assigned_to
    if (updates.assigned_to && task.user_id !== userId) {
      throw new Error('Only task owner can assign tasks');
    }

    // If assigned_to is being updated, validate that user exists
    if (updates.assigned_to) {
      const assignedUser = await User.findById(updates.assigned_to);
      if (!assignedUser) {
        throw new Error('Assigned user not found');
      }
    }

    const updatedTask = await task.update(updates);
    return updatedTask;
  }

  async deleteTask(taskId, userId) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Only task owner can delete
    if (task.user_id !== userId) {
      throw new Error('Unauthorized to delete this task');
    }

    await task.delete();
    return task;
  }
}

module.exports = new TaskService();

