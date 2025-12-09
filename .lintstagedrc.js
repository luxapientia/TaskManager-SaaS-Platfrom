const { execSync } = require('child_process');
const path = require('path');

const runCommand = (command, cwd) => {
  try {
    execSync(command, { 
      cwd: path.resolve(cwd), 
      stdio: 'inherit',
      shell: true
    });
  } catch (error) {
    process.exit(1);
  }
};

module.exports = {
  'frontend/**/*.{ts,tsx}': (filenames) => {
    runCommand('npm run lint:fix', 'frontend');
    runCommand('npm run format', 'frontend');
    runCommand('npm run type-check', 'frontend');
    return filenames;
  },
  'frontend/**/*.{json,css}': (filenames) => {
    runCommand('npm run format', 'frontend');
    return filenames;
  },
  'backend/**/*.js': (filenames) => {
    runCommand('npm run lint:fix', 'backend');
    runCommand('npm run format', 'backend');
    return filenames;
  },
  '*.{md,json}': [
    'npx prettier --write'
  ]
};
