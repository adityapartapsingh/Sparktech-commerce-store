const AppError = require('../utils/AppError');

/**
 * Validates req.body against a Zod schema.
 * Usage: validate(MyZodSchema)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // Zod v3 uses .errors, Zod v4 uses .issues — handle both safely
    const issues = result.error?.errors || result.error?.issues || [];
    const errors = issues.map((e) => `${(e.path || []).join('.')}: ${e.message}`);
    const message = errors.length > 0 ? `Validation failed: ${errors.join('; ')}` : 'Validation failed';
    return next(new AppError(message, 400));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
