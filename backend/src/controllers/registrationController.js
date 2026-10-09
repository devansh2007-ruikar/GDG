const registrationService = require('../services/registrationService');
const { sendSuccess } = require('../utils/response');

/**
 * Controller: Register user for an event
 */
const register = async (req, res, next) => {
  try {
    const registration = await registrationService.registerForEvent(req.user.id, req.params.id);
    return sendSuccess(res, 201, registration);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Unregister user from an event
 */
const unregister = async (req, res, next) => {
  try {
    await registrationService.unregisterFromEvent(req.user.id, req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Get authenticated user's registrations
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await registrationService.getUserRegistrations(req.user.id);
    return sendSuccess(res, 200, registrations);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Admin view attendees for an event
 */
const getAttendees = async (req, res, next) => {
  try {
    const attendees = await registrationService.getEventAttendees(req.params.id);
    return sendSuccess(res, 200, attendees);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Get ticket QR code
 */
const getQR = async (req, res, next) => {
  try {
    const data = await registrationService.getRegistrationQR(req.params.id, req.user);
    return sendSuccess(res, 200, data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  unregister,
  getMyRegistrations,
  getAttendees,
  getQR,
};
