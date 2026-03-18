const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    logger.warn('⚠️  Server starting without MongoDB. Update MONGO_URI in .env with your Atlas connection string.');
    // Don't exit — allow server to start so you can still test non-DB routes
  }
};

module.exports = connectDB;
