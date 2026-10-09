/**
 * Custom application error class.
 * Ensures consistent error codes, HTTP status codes, and operational flagging.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Distinguishes predictable business errors from unexpected runtime bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
