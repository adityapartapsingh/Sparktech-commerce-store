require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const logger = require('./src/utils/logger');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  connectRedis(); // Non-blocking - app runs without Redis

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      } catch (e) {
        logger.error(`MongoDB disconnect error: ${e.message}`);
      }
      try {
        const { getRedis } = require('./src/config/redis');
        const redis = getRedis();
        if (redis) {
          await redis.quit();
          logger.info('Redis connection closed');
        }
      } catch (e) {
        logger.error(`Redis disconnect error: ${e.message}`);
      }
      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown hangs
    setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err.message}`);
    shutdown('UNHANDLED_REJECTION');
  });
};

startServer();

// Self-ping to keep Render app awake
const PING_URL = process.env.BACKEND_URL || 'https://sparktech-commerce-store.onrender.com';
setInterval(() => {
  axios.get(PING_URL)
    .then(() => logger.info('Self-ping successful'))
    .catch((err) => logger.error(`Self-ping failed: ${err.message}`));
}, 14 * 60 * 1000); // Pings every 14 minutes

