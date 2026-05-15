const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');
const passport = require('passport');
const mongoose = require('mongoose');
const { getRedis } = require('./config/redis');

require('./config/passport'); // Initialize strategies

const app = express();

// ==========================
//  Security Headers
// ==========================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ==========================
//  CORS
// ==========================
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'https://sparktech-commerce-store.vercel.app',
]
  .filter(Boolean)
  .map(url => url.replace(/\/$/,""));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ==========================
//  Body Parsers
// ==========================
// Razorpay webhook needs raw body for HMAC signature verification — mount BEFORE express.json()
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// ==========================
//  Session (Redis-backed)
// ==========================
const redisClient = getRedis();
if (redisClient) {
  app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'SparkTech_session_secret_change_in_prod',
    resave: false,
    saveUninitialized: false,
    name: 'SparkTech.sid',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));
} else {
  // Fallback: in-memory session (dev only, won't persist across restarts)
  app.use(session({
    secret: process.env.SESSION_SECRET || 'SparkTech_session_secret_change_in_prod',
    resave: false,
    saveUninitialized: false,
    name: 'SparkTech.sid',
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  }));
}

// ==========================
//  Sanitization
// ==========================
// express-mongo-sanitize is incompatible with Express 5 (req.query is read-only).
// Custom lightweight sanitizer for req.body + req.params only.
// All user input is also validated via Zod schemas on each route.
const sanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) { delete obj[key]; continue; }
    if (typeof obj[key] === 'object') sanitize(obj[key]);
  }
  return obj;
};
app.use((req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  next();
});

// ==========================
//  Rate Limiting
// ==========================
app.use('/api', apiLimiter);

// ==========================
//  Health Check
// ==========================
app.get('/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redis = getRedis();
  const redisStatus = redis?.status === 'ready' ? 'connected' : 'disconnected';
  const isHealthy = mongoStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    time: new Date().toISOString(),
    services: { mongo: mongoStatus, redis: redisStatus },
  });
});

// ==========================
//  API Routes
// ==========================
app.use('/api/v1/auth',       require('./modules/auth/auth.routes'));
app.use('/api/v1/users',      require('./modules/users/user.routes'));
app.use('/api/v1/products',   require('./modules/products/product.routes'));
app.use('/api/v1/categories', require('./modules/categories/categories.routes'));
app.use('/api/v1/cart',       require('./modules/cart/cart.routes'));
app.use('/api/v1/orders',     require('./modules/orders/orders.routes'));
app.use('/api/v1/payments',   require('./modules/payments/payments.routes'));
app.use('/api/v1/reviews',    require('./modules/reviews/reviews.routes'));
app.use('/api/v1/feedback',   require('./modules/feedback/feedback.routes'));
app.use('/api/v1/wishlist',   require('./modules/wishlist/wishlist.routes'));
app.use('/api/v1/notifications', require('./modules/notifications/notifications.routes'));
app.use('/api/v1/admin',      require('./modules/admin/admin.routes'));

// ==========================
//  404 Handler
// ==========================
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ==========================
//  Global Error Handler
// ==========================
app.use(errorHandler);

module.exports = app;
