const express = require('express');
const registrationController = require('../controllers/registrationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me/registrations: Retrieves authenticated user's registrations (upcoming first, then past)
router.get('/me/registrations', authenticate, registrationController.getMyRegistrations);

module.exports = router;
