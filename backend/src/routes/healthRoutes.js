const express = require('express');

const router = express.Router();

/**
 * API Index endpoint
 * Returns friendly metadata and link references for base URL discovery
 */
router.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      name: 'GDG Event Management & Registration API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/docs',
      health: '/api/health',
      endpoints: {
        auth: '/api/auth',
        events: '/api/events',
        myRegistrations: '/api/users/me/registrations',
      },
      frontend: 'https://gdg-iota-inky.vercel.app',
    },
  });
});

/**
 * Health check endpoint
 * Returns both top-level { status: "ok" } and standard API envelope { success: true, data: { status: "ok" } }
 */
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
