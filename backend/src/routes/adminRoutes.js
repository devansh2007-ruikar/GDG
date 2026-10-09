const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/analytics - Platform analytics for admin users
router.get('/analytics', authenticate, authorize('ADMIN'), adminController.getAnalytics);

module.exports = router;
