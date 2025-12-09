module.exports = {
  'frontend/**/*.{ts,tsx}': [
    'bash -c "cd frontend && npm run lint:fix"',
    'bash -c "cd frontend && npm run format"',
    'bash -c "cd frontend && npm run type-check"'
  ],
  'frontend/**/*.{json,css}': [
    'bash -c "cd frontend && npm run format"'
  ],
  'backend/**/*.js': [
    'bash -c "cd backend && npm run lint:fix"',
    'bash -c "cd backend && npm run format"'
  ],
  '*.{md,json}': [
    'npx prettier --write'
  ]
};
