const userService = require('../services/userService');
const { randomUUID } = require('crypto');

// Helper to generate unique email
const uniqueEmail = (prefix) => `${prefix}-${randomUUID()}@example.com`;

describe('UserService', () => {
  describe('getUserById', () => {
    test('should return user by id', async () => {
      const email = uniqueEmail('getbyid');
      const user = await userService.register({
        email,
        password: 'Test1234',
        name: 'Get By Id User',
      });

      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');

      // Retry logic to handle potential race conditions
      let foundUser = null;
      let retries = 0;
      while (!foundUser && retries < 5) {
        try {
          foundUser = await userService.getUserById(user.id);
        } catch (error) {
          if (retries < 4) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            retries++;
            continue;
          }
          throw error;
        }
      }

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(user.id);
      expect(foundUser.email).toBe(email);
    });

    test('should throw error for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(userService.getUserById(fakeId)).rejects.toThrow(
        'User not found'
      );
    });
  });
});
