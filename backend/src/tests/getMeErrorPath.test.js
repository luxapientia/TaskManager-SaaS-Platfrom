const request = require('supertest');
const app = require('../index');
const authController = require('../controllers/authController');

describe('getMe Error Path', () => {
  test('should handle error in getMe catch block', async () => {
    // Create a user and get token
    const email = `getme-error-${Date.now()}@example.com`;
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'Test1234',
        name: 'GetMe Error User',
      });

    const token = registerResponse.body.token;

    // Test normal operation
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('user');

    // Test error path by mocking res.json to throw
    const mockReq = {
      user: { id: 'test-id', email: 'test@example.com' }
    };
    const mockRes = {
      json: jest.fn().mockImplementationOnce(() => {
        throw new Error('JSON serialization failed');
      }).mockImplementationOnce(() => {}),
      status: jest.fn().mockReturnThis()
    };

    // This should trigger the catch block (lines 92-94)
    await authController.getMe(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});
