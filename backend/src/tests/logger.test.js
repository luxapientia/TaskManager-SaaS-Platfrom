describe('Logger Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    // Clear module cache to reload logger
    delete require.cache[require.resolve('../utils/logger')];
  });

  test('should add file transports in production', () => {
    // Save original NODE_ENV
    const originalNodeEnv = process.env.NODE_ENV;

    // Use jest.isolateModules to ensure fresh module load
    jest.isolateModules(() => {
      // Set production environment BEFORE requiring logger
      process.env.NODE_ENV = 'production';

      // Require logger in isolated context to trigger production code path (lines 22-26)
      const logger = require('../utils/logger');

      expect(logger).toBeDefined();
      expect(logger.transports).toBeDefined();

      // Check that file transports are added in production
      const fileTransports = logger.transports.filter(
        (transport) => transport.constructor.name === 'File'
      );
      expect(fileTransports.length).toBe(2); // error.log and combined.log
    });

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  test('should not add file transports in test environment', () => {
    process.env.NODE_ENV = 'test';
    delete require.cache[require.resolve('../utils/logger')];
    const logger = require('../utils/logger');

    expect(logger).toBeDefined();
    // In test, only console transport should exist (no file transports)
    const hasFileTransport = logger.transports.some(
      (transport) => transport.constructor.name === 'File'
    );
    expect(hasFileTransport).toBe(false);
  });
});
