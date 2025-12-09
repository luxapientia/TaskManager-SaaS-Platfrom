require('dotenv').config();

module.exports = {
  'migrations-folder': './migrations',
  'migration-file-language': 'js',
  'migration-template-file': './migrations/template.js',
  'database-url': process.env.DATABASE_URL,
};





