const AppError = require('../utils/AppError');

/**
 * Validates req.body against a Zod schema.
 * Usage: validate(MyZodSchema)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return next(new AppError(`Validation failed: ${errors.join('; ')}`, 400));
  }
  req.body = result.data; // use cleaned/coerced data
  next();
};

module.exports = validate;
