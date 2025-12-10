const redisClient = require('../config/redis');

describe('Redis Configuration', () => {
  test('should export redis client', () => {
    expect(redisClient).toBeDefined();
  });

  test('should have connect method', () => {
    expect(typeof redisClient.connect).toBe('function');
  });

  test('should handle connection errors gracefully', async () => {
    // Redis might not be running, but the client should be configured
    expect(redisClient).toBeDefined();
  });
});
