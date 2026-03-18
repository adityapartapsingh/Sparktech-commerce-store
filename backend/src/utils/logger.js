const winston = require('winston');
const path = require('path');

const { combine, timestamp, errors, printf, colorize, json } = winston.format;

const devFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  transports: [
    new winston.transports.Console({
      format: combine(colorize({ all: true }), devFormat),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: json(),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: json(),
    }),
  ],
});

module.exports = logger;
