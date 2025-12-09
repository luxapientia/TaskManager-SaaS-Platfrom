const User = require('../models/User');
const pool = require('../config/database');

describe('User Model Error Handling', () => {
  describe('create error handling', () => {
    test('should handle database errors in create', async () => {
      // Create a user with a duplicate email to trigger a unique constraint error
      const email = `duplicate-error-${Date.now()}@example.com`;

      // Create first user
      await User.create({
        email,
        password: 'Test1234',
        name: 'First User',
      });

      // Try to create duplicate - this will trigger the error handler
      await expect(
        User.create({
          email, // Same email
          password: 'Test1234',
          name: 'Duplicate User',
        })
      ).rejects.toThrow();
    });
  });

  describe('findByEmail error handling', () => {
    test('should handle database errors in findByEmail', async () => {
      // Temporarily break the query to trigger error
      const originalQuery = pool.query;
      const mockError = new Error('Database connection failed');
      pool.query = jest.fn().mockRejectedValue(mockError);

      await expect(User.findByEmail('test@example.com')).rejects.toThrow(
        'Database connection failed'
      );

      // Restore original immediately
      pool.query = originalQuery;
    });
  });

  describe('findById error handling', () => {
    test('should handle database errors in findById', async () => {
      // Temporarily break the query to trigger error
      const originalQuery = pool.query;
      const mockError = new Error('Database connection failed');
      pool.query = jest.fn().mockRejectedValue(mockError);

      await expect(User.findById('123')).rejects.toThrow(
        'Database connection failed'
      );

      // Restore original immediately
      pool.query = originalQuery;
    });
  });
});
