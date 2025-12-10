const pool = require('../config/database');
const logger = require('../utils/logger');

class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.user_id = data.user_id;
    this.assigned_to = data.assigned_to;
    this.due_date = data.due_date;
    this.priority = data.priority;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create({ title, description, status, user_id, assigned_to, due_date, priority }) {
    const query = `
      INSERT INTO tasks (title, description, status, user_id, assigned_to, due_date, priority)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      title,
      description || null,
      status || 'todo',
      user_id,
      assigned_to || null,
      due_date || null,
      priority || 'medium',
    ];

    try {
      const result = await pool.query(query, values);
      const task = new Task(result.rows[0]);
      logger.info(`Task created: ${task.id}`);
      return task;
    } catch (error) {
      logger.error('Error creating task:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM tasks WHERE id = $1';
    const values = [id];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return new Task(result.rows[0]);
    } catch (error) {
      logger.error('Error finding task by id:', error);
      throw error;
    }
  }

  static async findByUserId(userId, filters = {}) {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const values = [userId];
    const conditions = [];

    if (filters.status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(filters.status);
    }

    if (filters.assigned_to) {
      conditions.push(`assigned_to = $${values.length + 1}`);
      values.push(filters.assigned_to);
    }

    if (filters.priority) {
      conditions.push(`priority = $${values.length + 1}`);
      values.push(filters.priority);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    try {
      const result = await pool.query(query, values);
      return result.rows.map((row) => new Task(row));
    } catch (error) {
      logger.error('Error finding tasks by user id:', error);
      throw error;
    }
  }

  static async findByAssignedTo(userId, filters = {}) {
    let query = 'SELECT * FROM tasks WHERE assigned_to = $1';
    const values = [userId];
    const conditions = [];

    if (filters.status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(filters.status);
    }

    if (filters.priority) {
      conditions.push(`priority = $${values.length + 1}`);
      values.push(filters.priority);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    try {
      const result = await pool.query(query, values);
      return result.rows.map((row) => new Task(row));
    } catch (error) {
      logger.error('Error finding tasks by assigned_to:', error);
      throw error;
    }
  }

  async update(updates) {
    const allowedFields = ['title', 'description', 'status', 'assigned_to', 'due_date', 'priority'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return this;
    }

    updateFields.push(`updated_at = current_timestamp`);
    values.push(this.id);

    const query = `
      UPDATE tasks
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      const updatedTask = new Task(result.rows[0]);
      logger.info(`Task updated: ${updatedTask.id}`);
      return updatedTask;
    } catch (error) {
      logger.error('Error updating task:', error);
      throw error;
    }
  }

  async delete() {
    const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    const values = [this.id];

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      logger.info(`Task deleted: ${this.id}`);
      return new Task(result.rows[0]);
    } catch (error) {
      logger.error('Error deleting task:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status,
      user_id: this.user_id,
      assigned_to: this.assigned_to,
      due_date: this.due_date,
      priority: this.priority,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Task;

