const pool = require('../config/database');
const redisClient = require('../config/redis');

let tableExistedBefore = false;
let indexExistedBefore = false;

beforeAll(async () => {
  try {
    await pool.query('SELECT 1');
    
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    tableExistedBefore = tableCheck.rows[0].exists;
    
    const indexCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = 'idx_users_email'
      );
    `);
    indexExistedBefore = indexCheck.rows[0].exists;
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT current_timestamp,
        updated_at TIMESTAMP NOT NULL DEFAULT current_timestamp
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
  } catch (error) {
    throw new Error(
      `Database setup failed: ${error.message}\n` +
      'Make sure PostgreSQL is running.\n' +
      'You can start it with: docker-compose up -d postgres\n' +
      'Or set DATABASE_URL environment variable.'
    );
  }
});

afterEach(async () => {
  try {
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  } catch (error) {
    // Ignore errors during cleanup if table doesn't exist or other issues
  }
});

afterAll(async () => {
  try {
    if (!indexExistedBefore) {
      await pool.query('DROP INDEX IF EXISTS idx_users_email');
    }
    if (!tableExistedBefore) {
      await pool.query('DROP TABLE IF EXISTS users');
    }
  } catch (error) {
    // Ignore errors during teardown
  }
  
  try {
    if (pool && !pool.ended) {
      await pool.end();
    }
  } catch (error) {
    // Ignore errors during pool closure
  }
  
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
    }
  } catch (error) {
    // Ignore errors during Redis closure
  }
});

