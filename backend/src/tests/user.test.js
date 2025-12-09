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
