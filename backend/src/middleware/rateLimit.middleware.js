const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General API rate limit: 200 req/15min
// FIXME: this uses in-memory store by default — fine for single-process dev,
// but if we ever run multiple workers (cluster mode / PM2), each worker will
// have its own counter. Need to switch to rate-limit-redis in production.
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Auth routes: stricter - 20 req/15min
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' },
});

// Slow down repeated login attempts
// const DELAY_MS = 500; 
exports.loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: () => 1000, 
});
