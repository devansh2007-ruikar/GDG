const eventService = require('../services/eventService');
const { sendSuccess } = require('../utils/response');

/**
 * Controller: List events with filters, search, and pagination
 */
const listEvents = async (req, res, next) => {
  try {
    const { events, meta } = await eventService.getEvents(req.query);
    return sendSuccess(res, 200, events, { meta });
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: List distinct categories
 */
const listCategories = async (req, res, next) => {
  try {
    const categories = await eventService.getCategories();
    return sendSuccess(res, 200, categories);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Get single event by ID (supports optional auth for isRegistered flag)
 */
const getEvent = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const event = await eventService.getEventById(req.params.id, currentUserId);
    return sendSuccess(res, 200, event);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Admin create event
 */
const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body, req.user.id);
    return sendSuccess(res, 201, event);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Admin update event
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    return sendSuccess(res, 200, event);
  } catch (error) {
    return next(error);
  }
};

/**
 * Controller: Admin delete event
 */
const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listEvents,
  listCategories,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
};
