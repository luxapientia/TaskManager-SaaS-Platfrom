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

  describe('updateProfile', () => {
    test('should update user name', async () => {
      const email = uniqueEmail('updatename');
      const user = await userService.register({
        email,
        password: 'Test1234',
        name: 'Original Name',
      });

      const updatedUser = await userService.updateProfile(user.id, {
        name: 'Updated Name',
      });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe(email);
      expect(updatedUser.id).toBe(user.id);
    });

    test('should update user email', async () => {
      const email = uniqueEmail('updateemail');
      const user = await userService.register({
        email,
        password: 'Test1234',
        name: 'Update Email User',
      });

      const newEmail = uniqueEmail('newemail');
      const updatedUser = await userService.updateProfile(user.id, {
        email: newEmail,
      });

      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.name).toBe(user.name);
    });

    test('should update both name and email', async () => {
      const email = uniqueEmail('updateboth');
      const user = await userService.register({
        email,
        password: 'Test1234',
        name: 'Original Name',
      });

      const newEmail = uniqueEmail('newboth');
      const updatedUser = await userService.updateProfile(user.id, {
        name: 'New Name',
        email: newEmail,
      });

      expect(updatedUser.name).toBe('New Name');
      expect(updatedUser.email).toBe(newEmail);
    });

    test('should throw error if user not found', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await expect(
        userService.updateProfile(fakeId, { name: 'New Name' })
      ).rejects.toThrow('User not found');
    });

    test('should throw error if email already in use', async () => {
      const email1 = uniqueEmail('existing');
      const email2 = uniqueEmail('existing2');
      await userService.register({
        email: email1,
        password: 'Test1234',
        name: 'User 1',
      });
      const user2 = await userService.register({
        email: email2,
        password: 'Test1234',
        name: 'User 2',
      });

      await expect(
        userService.updateProfile(user2.id, { email: email1 })
      ).rejects.toThrow('Email already in use');
    });

    test('should allow updating to same email', async () => {
      const email = uniqueEmail('sameemail');
      const user = await userService.register({
        email,
        password: 'Test1234',
        name: 'Same Email User',
      });

      const updatedUser = await userService.updateProfile(user.id, {
        email: email,
        name: 'Updated Name',
      });

      expect(updatedUser.email).toBe(email);
      expect(updatedUser.name).toBe('Updated Name');
    });
  });
});
