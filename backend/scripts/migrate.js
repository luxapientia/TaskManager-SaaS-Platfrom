#!/usr/bin/env node

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
// Use npx to find node-pg-migrate binary
const command = ['npx', 'node-pg-migrate', ...args].join(' ');

try {
  execSync(command, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..'),
  });
} catch (error) {
  process.exit(error.status || 1);
}

