const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');
const errorHandler = require('../src/middleware/errorHandler');
const AppError = require('../src/utils/appError');

describe('Rate Limiter Behavior', () => {
  it('should return 429 TOO_MANY_REQUESTS with standard envelope when threshold exceeded', async () => {
    const testApp = express();
    testApp.use(express.json());

    // Configure a micro test limiter with threshold of 2 requests
    const testLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res, next) => {
        next(
          new AppError(
            'Too many authentication attempts. Please try again after 1 minute.',
            429,
            'TOO_MANY_REQUESTS'
          )
        );
      },
    });

    testApp.post('/test-limit', testLimiter, (req, res) => res.json({ success: true }));
    testApp.use(errorHandler);

    // Request 1: allowed
    const res1 = await request(testApp).post('/test-limit');
    expect(res1.statusCode).toBe(200);

    // Request 2: allowed
    const res2 = await request(testApp).post('/test-limit');
    expect(res2.statusCode).toBe(200);

    // Request 3: blocked with 429
    const res3 = await request(testApp).post('/test-limit');
    expect(res3.statusCode).toBe(429);
    expect(res3.body.success).toBe(false);
    expect(res3.body.error.code).toBe('TOO_MANY_REQUESTS');
  });
});
