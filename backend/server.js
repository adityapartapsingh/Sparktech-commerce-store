require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { connectRedis } = require('./src/config/redis');
const logger = require('./src/utils/logger');
const fs = require('fs');
const path = require('path');

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
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled rejection: ${err.message}`);
    shutdown('UNHANDLED_REJECTION');
  });
};

startServer();
