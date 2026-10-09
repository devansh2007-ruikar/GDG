/**
 * Standardized success response helper
 * Envelope format: { success: true, data: ... }
 */
const sendSuccess = (res, statusCode = 200, data = null, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...extra,
  });
};

module.exports = {
  sendSuccess,
};
