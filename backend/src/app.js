const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

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
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

// ==========================
//  Sanitization
// ==========================
// app.use(mongoSanitize()); // Disabled to fix req.query TypeError
// app.use(xss());        // Removed because xss-clean is unmaintained and throws TypeError on req.query

// ==========================
//  Rate Limiting
// ==========================
app.use('/api', apiLimiter);

// ==========================
//  Health Check
// ==========================
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ==========================
//  API Routes
// ==========================
app.use('/api/v1/auth',       require('./modules/auth/auth.routes'));
app.use('/api/v1/products',   require('./modules/products/product.routes'));
app.use('/api/v1/categories', require('./modules/categories/categories.routes'));
app.use('/api/v1/cart',       require('./modules/cart/cart.routes'));
app.use('/api/v1/orders',     require('./modules/orders/orders.routes'));
app.use('/api/v1/payments',   require('./modules/payments/payments.routes'));
app.use('/api/v1/reviews',    require('./modules/reviews/reviews.routes'));
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
