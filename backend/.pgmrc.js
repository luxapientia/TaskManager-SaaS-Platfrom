require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('\n❌ Error: DATABASE_URL environment variable is not set!\n');
  console.error('Please create a .env file in the backend directory with:');
  console.error('  DATABASE_URL=postgresql://dev:dev123@localhost:5450/taskmanager\n');
  console.error('Or copy .env.example to .env and update the values:');
  console.error('  cp .env.example .env\n');
  process.exit(1);
}

module.exports = {
  'migrations-folder': './migrations',
  'migration-file-language': 'js',
  'database-url': process.env.DATABASE_URL,
};





