const express = require('express');
const eventController = require('../controllers/eventController');
const registrationController = require('../controllers/registrationController');
const {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  eventIdParamSchema,
} = require('../validators/eventValidators');
const validate = require('../middleware/validate');
const { authenticate, authorize, optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

// 1. PUBLIC ROUTES
// Note: /categories route declared before /:id to prevent route collision
router.get(
  '/',
  validate({ query: eventQuerySchema }),
  eventController.listEvents
);

router.get(
  '/categories',
  eventController.listCategories
);

router.get(
  '/:id',
  optionalAuthenticate,
  validate({ params: eventIdParamSchema }),
  eventController.getEvent
);

// 2. USER REGISTRATION ROUTES (Authenticated)
router.post(
  '/:id/register',
  authenticate,
  validate({ params: eventIdParamSchema }),
  registrationController.register
);

router.delete(
  '/:id/register',
  authenticate,
  validate({ params: eventIdParamSchema }),
  registrationController.unregister
);

// 3. ADMIN PROTECTED ROUTES
router.get(
  '/:id/registrations',
  authenticate,
  authorize('ADMIN'),
  validate({ params: eventIdParamSchema }),
  registrationController.getAttendees
);

router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createEventSchema),
  eventController.createEvent
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate({ params: eventIdParamSchema, body: updateEventSchema }),
  eventController.updateEvent
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate({ params: eventIdParamSchema }),
  eventController.deleteEvent
);

module.exports = router;

