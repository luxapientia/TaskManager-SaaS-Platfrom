if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://dev:dev123@localhost:5450/taskmanager';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key';
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

