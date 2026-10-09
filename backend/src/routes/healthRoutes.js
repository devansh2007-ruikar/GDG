const express = require('express');

const router = express.Router();

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
