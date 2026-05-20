const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User.model');

// Extract access token from Authorization header OR cookies
const extractToken = (req) => {
  // 1. Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  // 2. Fallback to cookie
  return req.cookies?.accessToken;
};

exports.protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  const currentUser = await User.findById(decoded.id).select('-password -refreshToken');

  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = currentUser;
  next();
});

// Optional auth - doesn't fail if no token, just sets req.user if available
exports.optionalProtect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');
  } catch {
    // ignore invalid token for optional routes
  }
  next();
});
