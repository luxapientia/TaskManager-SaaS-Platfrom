require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'TaskManager API is running' });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'TaskManager API',
    version: '0.1.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
    },
  });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
