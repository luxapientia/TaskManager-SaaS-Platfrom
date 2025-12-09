const redis = require('redis');
const logger = require('../utils/logger');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => {
  logger.error('Redis Client Error', err);
});

client.on('connect', () => {
  logger.info('Connected to Redis');
});

if (!client.isOpen) {
  client.connect().catch((err) => {
    logger.error('Failed to connect to Redis', err);
  });
}

module.exports = client;
