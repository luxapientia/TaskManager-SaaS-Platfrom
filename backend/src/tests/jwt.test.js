const {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
} = require('../utils/jwt');

describe('JWT Utils', () => {
  const payload = { userId: '123', email: 'test@example.com' };
  let originalJwtSecret;

  beforeAll(() => {
    originalJwtSecret = process.env.JWT_SECRET;
  });

  afterAll(() => {
    if (originalJwtSecret !== undefined) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
    // Clear module cache to reload with original env
    jest.resetModules();
  });

  describe('generateToken', () => {
    test('should generate a valid token', () => {
      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('generateRefreshToken', () => {
    test('should generate a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyToken', () => {
    test('should verify a valid token', () => {
      const token = generateToken(payload);
      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    test('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow(
        'Invalid or expired token'
      );
    });

    test('should throw error for tampered token', () => {
      const token = generateToken(payload);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      expect(() => verifyToken(tamperedToken)).toThrow(
        'Invalid or expired token'
      );
    });
  });

  describe('verifyRefreshToken', () => {
    test('should verify a valid refresh token', () => {
      const token = generateRefreshToken(payload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(payload.userId);
    });

    test('should throw error for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-token')).toThrow(
        'Invalid or expired refresh token'
      );
    });
  });

  describe('JWT_SECRET fallback', () => {
    let savedJwtSecret;

    beforeEach(() => {
      // Save current JWT_SECRET
      savedJwtSecret = process.env.JWT_SECRET;
    });

    afterEach(() => {
      // Restore JWT_SECRET
      if (savedJwtSecret !== undefined) {
        process.env.JWT_SECRET = savedJwtSecret;
      } else {
        delete process.env.JWT_SECRET;
      }
      // Clear module cache to reload with restored env
      jest.resetModules();
    });

    test('should use fallback secret when JWT_SECRET is not set', () => {
      // Remove JWT_SECRET to test fallback (line 5 in jwt.js)
      delete process.env.JWT_SECRET;
      
      // Clear module cache to reload with new env
      jest.resetModules();
      
      // Reload the module - this will use the fallback value 'your-secret-key-change-in-production'
      const jwtUtils = require('../utils/jwt');
      
      // Generate a token with the fallback secret
      const token = jwtUtils.generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify the token can be verified (proving fallback was used)
      const decoded = jwtUtils.verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });
});
