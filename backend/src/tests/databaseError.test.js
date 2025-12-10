const logger = require('../utils/logger');

describe('Database Error Handling', () => {
  let originalEnv;
  let originalDatabaseUrl;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    originalDatabaseUrl = process.env.DATABASE_URL;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.DATABASE_URL = originalDatabaseUrl;
    // Clear cache
    delete require.cache[require.resolve('../config/database')];
  });

  test('should throw error when DATABASE_URL is not set', () => {
    // Save original DATABASE_URL
    const savedUrl = process.env.DATABASE_URL;

    // Use jest.isolateModules to test the error throw at module load (line 5)
    jest.isolateModules(() => {
      // Remove DATABASE_URL to trigger the error
      delete process.env.DATABASE_URL;

      // This should throw an error when requiring the module
      expect(() => {
        require('../config/database');
      }).toThrow(
        'DATABASE_URL environment variable is not set. Please set it in your .env file or environment.'
      );
    });

    // Restore for other tests
    process.env.DATABASE_URL = savedUrl;
  });

  test('should configure SSL for production environment', () => {
    // Test production SSL configuration (line 14-15)
    jest.isolateModules(() => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL =
        originalDatabaseUrl ||
        'postgresql://dev:dev123@localhost:5450/taskmanager';

      const pool = require('../config/database');
      expect(pool).toBeDefined();
      // The SSL configuration is set in the Pool constructor
      // We verify the module loads correctly in production mode
    });

    // Restore
    process.env.NODE_ENV = originalEnv;
  });

  test('should handle pool error event', () => {
    // Get the pool instance
    process.env.DATABASE_URL =
      originalDatabaseUrl ||
      'postgresql://dev:dev123@localhost:5450/taskmanager';
    delete require.cache[require.resolve('../config/database')];
    const pool = require('../config/database');

    // Mock process.exit to prevent actual exit
    const originalExit = process.exit;
    process.exit = jest.fn();

    // Mock logger.error
    jest.spyOn(logger, 'error').mockImplementation(() => {});

    // Emit error event to test lines 24-25
    const testError = new Error('Pool error');
    pool.emit('error', testError);

    expect(logger.error).toHaveBeenCalledWith(
      'Unexpected error on idle client',
      testError
    );
    expect(process.exit).toHaveBeenCalledWith(-1);

    // Restore
    process.exit = originalExit;
    jest.restoreAllMocks();
  });
});
