const rateLimit = require('express-rate-limit');
const AppError = require('../utils/appError');

/**
 * Rate Limiter for Authentication Endpoints
 * Limits requests to 5 per minute per IP to prevent brute-force and credential-stuffing attacks.
 * Integrates with central error handler for consistent error envelopes.
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'test' ? 1000 : 5, // Relaxed in test environment to avoid flaky integration tests
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  handler: (req, res, next) => {
    next(
      new AppError(
        'Too many authentication attempts. Please try again after 1 minute.',
        429,
        'TOO_MANY_REQUESTS'
      )
    );
  },
});

module.exports = {
  authLimiter,
};
