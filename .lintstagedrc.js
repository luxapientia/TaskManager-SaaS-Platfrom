module.exports = {
  'frontend/**/*.{ts,tsx}': [
    'cd frontend && npm run lint:fix',
    'cd frontend && npm run format'
  ],
  'frontend/**/*.{json,css}': [
    'cd frontend && npm run format'
  ],
  'backend/**/*.js': [
    'cd backend && npm run lint:fix',
    'cd backend && npm run format'
  ],
  '*.{md,json}': [
    'npx prettier --write'
  ]
};
