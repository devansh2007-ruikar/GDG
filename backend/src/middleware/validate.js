const AppError = require('../utils/appError');

/**
 * Middleware factory for validating incoming requests with Zod.
 * Supports passing either:
 * 1. A single Zod schema (validates req.body by default)
 * 2. An object with { body, query, params } schemas
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Single schema passed -> validate req.body
    if (schema && typeof schema.safeParse === 'function') {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const details = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        return next(new AppError('Validation failed', 422, 'VALIDATION_ERROR', details));
      }
      req.body = result.data;
      return next();
    }

    // Composite schema { body, query, params }
    const parts = ['body', 'query', 'params'];
    const collectedErrors = [];

    for (const part of parts) {
      if (schema[part] && typeof schema[part].safeParse === 'function') {
        const result = schema[part].safeParse(req[part]);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            collectedErrors.push({
              field: issue.path.length > 0 ? issue.path.join('.') : part,
              message: issue.message,
            });
          });
        } else {
          req[part] = result.data;
        }
      }
    }

    if (collectedErrors.length > 0) {
      return next(new AppError('Validation failed', 422, 'VALIDATION_ERROR', collectedErrors));
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = validate;
