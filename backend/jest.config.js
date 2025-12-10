module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js'
  ],
  setupFiles: ['<rootDir>/src/tests/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  forceExit: true,
  maxWorkers: 1
};

