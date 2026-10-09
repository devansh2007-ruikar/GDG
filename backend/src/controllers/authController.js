const authService = require('../services/authService');
const { sendSuccess } = require('../utils/response');

/**
 * Controller: Handles user registration
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, 201, result);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Handles user login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Retrieves profile of current authenticated user
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return sendSuccess(res, 200, { user });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
