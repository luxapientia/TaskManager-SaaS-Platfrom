const Task = require('../models/Task');
const pool = require('../config/database');
const { randomUUID } = require('crypto');

describe('Task Model Error Handling', () => {
  describe('create', () => {
    test('should throw error on database failure', async () => {
      // Mock pool.query to throw an error
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(
        Task.create({
          title: 'Test Task',
          user_id: randomUUID(),
        })
      ).rejects.toThrow('Database connection failed');

      // Restore original query
      pool.query = originalQuery;
    });
  });

  describe('update', () => {
    test('should throw error on database failure', async () => {
      const task = new Task({
        id: randomUUID(),
        title: 'Test Task',
        status: 'todo',
        user_id: randomUUID(),
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Mock pool.query to throw an error
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(
        task.update({ title: 'Updated Task' })
      ).rejects.toThrow('Database connection failed');

      // Restore original query
      pool.query = originalQuery;
    });
  });

  describe('findById', () => {
    test('should throw error on database failure', async () => {
      // Mock pool.query to throw an error
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(Task.findById(randomUUID())).rejects.toThrow('Database connection failed');

      // Restore original query
      pool.query = originalQuery;
    });
  });

  describe('findByUserId', () => {
    test('should throw error on database failure', async () => {
      // Mock pool.query to throw an error
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(Task.findByUserId(randomUUID())).rejects.toThrow('Database connection failed');

      // Restore original query
      pool.query = originalQuery;
    });
  });

  describe('findByAssignedTo', () => {
    test('should throw error on database failure', async () => {
      // Mock pool.query to throw an error
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(Task.findByAssignedTo(randomUUID())).rejects.toThrow('Database connection failed');

      // Restore original query
      pool.query = originalQuery;
    });
  });

  describe('update', () => {
    test('should return task unchanged when no fields to update', async () => {
      const task = new Task({
        id: randomUUID(),
        title: 'Test Task',
        status: 'todo',
        user_id: randomUUID(),
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Update with empty object or no valid fields
      const result = await task.update({});
      expect(result).toBe(task);
    });

    test('should throw error on database failure', async () => {
      const task = new Task({
        id: randomUUID(),
        title: 'Test Task',
        status: 'todo',
        user_id: randomUUID(),
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Mock pool.query to throw an error
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(
        task.update({ title: 'Updated Task' })
      ).rejects.toThrow('Database connection failed');

      // Restore original query
      pool.query = originalQuery;
    });
  });

  describe('delete', () => {
    test('should return null when task not found', async () => {
      const task = new Task({
        id: randomUUID(),
        title: 'Test Task',
        status: 'todo',
        user_id: randomUUID(),
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Mock pool.query to return empty result
      const originalQuery = pool.query;
      pool.query = jest.fn().mockResolvedValue({ rows: [] });

      const result = await task.delete();
      expect(result).toBeNull();

      // Restore original query
      pool.query = originalQuery;
    });

    test('should throw error on database failure', async () => {
      const task = new Task({
        id: randomUUID(),
        title: 'Test Task',
        status: 'todo',
        user_id: randomUUID(),
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Mock pool.query to throw an error
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      await expect(task.delete()).rejects.toThrow('Database connection failed');

      // Restore original query
      pool.query = originalQuery;
    });
  });
});




