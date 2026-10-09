const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const config = require('../config/env');
const AppError = require('../utils/appError');

/**
 * Authentication Middleware
 * Validates incoming Bearer token from the Authorization header and verifies signature.
 * Attaches the authenticated user entity to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check presence of Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication token is required', 401, 'UNAUTHORIZED'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Authentication token is required', 401, 'UNAUTHORIZED'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      // Handles both malformed tokens and expired signatures
      return next(new AppError('Invalid or expired authentication token', 401, 'INVALID_TOKEN'));
    }

    // Verify user still exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401, 'UNAUTHORIZED'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to users holding specific roles (e.g. ADMIN).
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required before authorization', 401, 'UNAUTHORIZED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'));
    }

    next();
  };
};

/**
 * Optional Authentication Middleware
 * If a valid Bearer token is provided, attaches req.user.
 * If no token is provided or the token is invalid, continues as guest without throwing an error.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (user) {
        req.user = user;
      }
    } catch {
      // Intentionally ignore invalid or expired tokens in optional auth mode
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuthenticate,
};

