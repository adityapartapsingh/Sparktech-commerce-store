const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

const connectRedis = () => {
  try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      reconnectOnError: (err) => {
        logger.warn(`Redis reconnecting after error: ${err.message}`);
        return true;
      },
    });

    redis.on('connect', () => logger.info('Redis Connected'));
    redis.on('error', (err) => logger.error(`Redis Error: ${err.message}`));
  } catch (error) {
    logger.error(`Redis connection failed: ${error.message}`);
    // App continues without cache if Redis is unavailable
    redis = null;
  }
  return redis;
};

const getRedis = () => redis;

module.exports = { connectRedis, getRedis };
