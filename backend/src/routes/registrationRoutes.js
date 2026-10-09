const express = require('express');
const registrationController = require('../controllers/registrationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/registrations/:id/qr - Returns digital ticket QR code
// Security: Accessible exclusively by the ticket owner or an ADMIN
router.get('/:id/qr', authenticate, registrationController.getQR);

module.exports = router;
