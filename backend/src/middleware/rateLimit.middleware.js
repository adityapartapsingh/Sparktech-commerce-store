const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// General API rate limit: 200 req/15min
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
exports.loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 5,
  delayMs: () => 1000, // add 1s delay per request after delayAfter
});
