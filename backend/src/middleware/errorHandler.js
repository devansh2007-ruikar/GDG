const AppError = require('../utils/appError');

/**
 * Central Error Handler Middleware
 * Normalizes all errors (AppError, Prisma, Zod, JWT, unexpected) into the consistent shape:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "EVENT_FULL",
 *     "message": "...",
 *     "details": ... (optional)
 *   }
 * }
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    // Unique constraint violation (e.g. duplicate email or duplicate registration)
    statusCode = 409;
    const target = err.meta?.target ? ` (${err.meta.target})` : '';
    code = 'DUPLICATE_ENTRY';
    message = `A record with this field already exists${target}.`;
  } else if (err.code === 'P2025') {
    // Record not found in update/delete operations
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Requested record not found.';
  }

  // Handle JWT specific errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token provided.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired. Please log in again.';
  }

  // In development, log unexpected server errors for debugging
  if (statusCode === 500 && process.env.NODE_ENV !== 'test') {
    console.error('💥 UNEXPECTED SERVER ERROR:', err);
  }

  const errorResponse = {
    code,
    message,
  };

  if (details) {
    errorResponse.details = details;
  }

  return res.status(statusCode).json({
    success: false,
    error: errorResponse,
  });
};

module.exports = errorHandler;
