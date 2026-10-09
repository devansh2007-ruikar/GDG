const express = require('express');
const authController = require('../controllers/authController');
const { registerSchema, loginSchema } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes with rate limiting and schema validation
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected routes requiring valid Bearer JWT
router.get('/me', authenticate, authController.getMe);

module.exports = router;
