describe('Redis Catch Handler', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  test('should handle connection error in catch block', async () => {
    // Test the catch handler (lines 18-19 in redis.js)
    // This code only runs when NODE_ENV !== 'test' and !client.isOpen
    
    const mockError = new Error('Failed to connect to Redis');
    const mockConnect = jest.fn().mockRejectedValue(mockError);
    const mockLoggerError = jest.fn();
    
    const mockClient = {
      on: jest.fn(),
      connect: mockConnect,
      get isOpen() { return false; },
      emit: jest.fn(),
    };

    // Use jest.isolateModules to ensure clean module loading
    jest.isolateModules(() => {
      // Mock logger first
      jest.doMock('../utils/logger', () => ({
        error: mockLoggerError,
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      }));

      // Mock redis before requiring
      jest.doMock('redis', () => ({
        createClient: () => mockClient,
      }));

      // Change NODE_ENV to trigger the code path
      process.env.NODE_ENV = 'development';
      
      // Load the module in isolation - this will use our mocked logger
      require('../config/redis');
    });
    
    // Wait for async connect().catch() to execute
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    // Verify connect was called
    expect(mockConnect).toHaveBeenCalled();
    
    // Verify the catch block called logger.error
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Failed to connect to Redis',
      mockError
    );
  });
});
