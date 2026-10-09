const AppError = require('../utils/appError');

/**
 * 404 Not Found Middleware
 * Forwards unmatched routes to the central error handler
 */
const notFound = (req, res, next) => {
  next(new AppError(`Resource not found at ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

module.exports = notFound;
