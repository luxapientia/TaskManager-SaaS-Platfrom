module.exports = {
  'frontend/**/*.{ts,tsx}': [
    'cd frontend && npx eslint --fix',
    'cd frontend && npx prettier --write'
  ],
  'frontend/**/*.{json,css}': [
    'cd frontend && npx prettier --write'
  ],
  'backend/**/*.js': [
    'cd backend && npx eslint --fix',
    'cd backend && npx prettier --write'
  ],
  '*.{md,json}': [
    'npx prettier --write'
  ]
};

