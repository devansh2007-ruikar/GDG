const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/response');

/**
 * Controller: Get admin platform analytics
 */
const getAnalytics = async (req, res, next) => {
  try {
    const data = await analyticsService.getAdminAnalytics();
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAnalytics,
};
