const request = require('supertest');
const app = require('../index');
const { generateToken } = require('../utils/jwt');

describe('Auth Middleware', () => {
  describe('authenticate middleware', () => {
    test('should reject when user not found after token verification', async () => {
      // Generate a valid token for a non-existent user
      const fakeUserId = '00000000-0000-0000-0000-000000000000';
      const token = generateToken({
        userId: fakeUserId,
        email: 'fake@example.com',
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('User not found');
    });
  });
});
