const User = require('../models/User');
const { randomUUID } = require('crypto');

// Helper to generate unique email
const uniqueEmail = (prefix) => `${prefix}-${randomUUID()}@example.com`;

describe('User Model', () => {
  describe('create', () => {
    test('should create a new user', async () => {
      const email = uniqueEmail('model');
      const user = await User.create({
        email,
        password: 'Test1234',
        name: 'Model User',
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.name).toBe('Model User');
      expect(user.id).toBeDefined();
    });
  });

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const email = uniqueEmail('findemail');
      await User.create({
        email,
        password: 'Test1234',
        name: 'Find Email User',
      });

      // Retry logic to handle potential race conditions
      let user = null;
      let retries = 0;
      while (!user && retries < 5) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        user = await User.findByEmail(email);
        retries++;
      }

      expect(user).not.toBeNull();
      expect(user).toBeDefined();
      expect(user.email).toBe(email);
    });

    test('should return null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    test('should find user by id', async () => {
      const email = uniqueEmail('findid');
      const createdUser = await User.create({
        email,
        password: 'Test1234',
        name: 'Find Id User',
      });

      expect(createdUser.id).toBeDefined();

      // Small delay to ensure database commit
      await new Promise((resolve) => setTimeout(resolve, 10));

      const user = await User.findById(createdUser.id);
      expect(user).not.toBeNull();
      expect(user).toBeDefined();
      expect(user.id).toBe(createdUser.id);
      expect(user.email).toBe(email);
    });

    test('should return null for non-existent id', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const user = await User.findById(fakeId);
      expect(user).toBeNull();
    });
  });

  describe('validatePassword', () => {
    test('should validate correct password', async () => {
      const email = uniqueEmail('validate');
      await User.create({
        email,
        password: 'Test1234',
        name: 'Validate User',
      });

      // Fetch user again to get password_hash (create doesn't return it)
      let user = await User.findByEmail(email);
      let retries = 0;
      while (!user && retries < 5) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        user = await User.findByEmail(email);
        retries++;
      }

      expect(user).not.toBeNull();
      expect(user.email).toBe(email);
      const isValid = await user.validatePassword('Test1234');
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const email = uniqueEmail('validate2');
      await User.create({
        email,
        password: 'Test1234',
        name: 'Validate User 2',
      });

      // Fetch user again to get password_hash (create doesn't return it)
      let user = await User.findByEmail(email);
      let retries = 0;
      while (!user && retries < 5) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        user = await User.findByEmail(email);
        retries++;
      }

      expect(user).not.toBeNull();
      expect(user.email).toBe(email);
      const isValid = await user.validatePassword('WrongPassword');
      expect(isValid).toBe(false);
    });
  });

  describe('update', () => {
    test('should update user name', async () => {
      const email = uniqueEmail('update');
      const user = await User.create({
        email,
        password: 'Test1234',
        name: 'Original Name',
      });

      const updatedUser = await user.update({ name: 'Updated Name' });

      expect(updatedUser.name).toBe('Updated Name');
      expect(updatedUser.email).toBe(email);
      expect(updatedUser.id).toBe(user.id);
    });

    test('should update user email', async () => {
      const email = uniqueEmail('updateemail');
      const user = await User.create({
        email,
        password: 'Test1234',
        name: 'Update Email User',
      });

      const newEmail = uniqueEmail('newemail');
      const updatedUser = await user.update({ email: newEmail });

      expect(updatedUser.email).toBe(newEmail);
      expect(updatedUser.name).toBe(user.name);
    });

    test('should update both name and email', async () => {
      const email = uniqueEmail('updateboth');
      const user = await User.create({
        email,
        password: 'Test1234',
        name: 'Original Name',
      });

      const newEmail = uniqueEmail('newboth');
      const updatedUser = await user.update({
        name: 'New Name',
        email: newEmail,
      });

      expect(updatedUser.name).toBe('New Name');
      expect(updatedUser.email).toBe(newEmail);
    });

    test('should return same user if no updates provided', async () => {
      const email = uniqueEmail('noupdate');
      const user = await User.create({
        email,
        password: 'Test1234',
        name: 'No Update User',
      });

      const updatedUser = await user.update({});

      expect(updatedUser).toBe(user);
    });

    test('should update updated_at timestamp', async () => {
      const email = uniqueEmail('timestamp');
      const user = await User.create({
        email,
        password: 'Test1234',
        name: 'Timestamp User',
      });

      const originalUpdatedAt = user.updated_at;
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedUser = await user.update({ name: 'Updated Name' });

      expect(updatedUser.updated_at).not.toBe(originalUpdatedAt);
    });

    test('should throw error on database failure', async () => {
      const email = uniqueEmail('dberror');
      const user = await User.create({
        email,
        password: 'Test1234',
        name: 'DB Error User',
      });

      const pool = require('../config/database');
      const querySpy = jest
        .spyOn(pool, 'query')
        .mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(user.update({ name: 'Updated Name' })).rejects.toThrow(
        'Database connection failed'
      );

      querySpy.mockRestore();
    });
  });

  describe('toJSON', () => {
    test('should return user data without password_hash', async () => {
      const email = uniqueEmail('json');
      const user = await User.create({
        email,
        password: 'Test1234',
        name: 'JSON User',
      });

      const json = user.toJSON();
      expect(json).not.toHaveProperty('password_hash');
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('name');
    });
  });
});
