const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const config = require('../config/env');
const AppError = require('../utils/appError');

/**
 * Generate signed JWT containing minimal identity claims.
 * Keeps payload lightweight while avoiding exposure of sensitive user data.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Format user object for client response (omits passwordHash)
 */
const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

/**
 * Register a new user
 * - Enforces role to USER (prevents privilege escalation attack)
 * - Checks for duplicate email -> 409 EMAIL_EXISTS
 * - Hashes password with bcrypt (10 rounds)
 */
const register = async ({ name, email, password }) => {
  // Check if email already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS');
  }

  // Hash password with 10 salt rounds
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Security rule: Role is ALWAYS USER upon registration, ignoring any client inputs
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'USER',
    },
  });

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Authenticate existing user
 * - Uses a generic error message for non-existent users AND bad passwords to prevent email enumeration
 */
const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Generic message on user not found prevents email harvesting
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = generateToken(user);

  return {
    user: sanitizeUser(user),
    token,
  };
};

/**
 * Get profile of currently authenticated user
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  return user;
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
