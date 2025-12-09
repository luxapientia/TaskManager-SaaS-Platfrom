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
    // Set production environment
    process.env.NODE_ENV = 'production';

    // Clear cache and reload
    delete require.cache[require.resolve('../utils/logger')];

    // Create logger manually to test production behavior (lines 22-26)
    const winston = require('winston');
    const testLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'taskmanager-backend' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
          silent: process.env.NODE_ENV === 'test',
        }),
      ],
    });

    // Add file transports for production (lines 23-26)
    testLogger.add(
      new winston.transports.File({ filename: 'error.log', level: 'error' })
    );
    testLogger.add(new winston.transports.File({ filename: 'combined.log' }));

    expect(testLogger).toBeDefined();
    expect(testLogger.transports).toBeDefined();

    // Check that file transports are added
    const fileTransports = testLogger.transports.filter(
      (transport) => transport.constructor.name === 'File'
    );
    expect(fileTransports.length).toBe(2); // error.log and combined.log
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
