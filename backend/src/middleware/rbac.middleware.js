const AppError = require('../utils/AppError');

/**
 * Role-Based Access Control middleware.
 * Usage: authorize('admin') or authorize('admin', 'manager')
 */
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError(`You do not have permission to perform this action. Required: ${roles.join(' or ')}`, 403));
  }
  next();
};
