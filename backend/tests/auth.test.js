const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/db');
const config = require('../src/config/env');

describe('Authentication & Protected Routes API', () => {
  const testUser = {
    name: 'Test Candidate',
    email: 'candidate@gdg.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    // Clean up test user if previously exists
    await prisma.registration.deleteMany({
      where: { user: { email: { in: [testUser.email, 'another@gdg.com'] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email, 'another@gdg.com'] } },
    });
  });

  afterAll(async () => {
    await prisma.registration.deleteMany({
      where: { user: { email: { in: [testUser.email, 'another@gdg.com'] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testUser.email, 'another@gdg.com'] } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with 201 Created', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.name).toBe(testUser.name);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Sensitive data omitted
      expect(res.body.data.token).toBeDefined();

      // Verify JWT payload contains only id and role
      const decoded = jwt.verify(res.body.data.token, config.jwtSecret);
      expect(decoded.id).toBe(res.body.data.user.id);
      expect(decoded.role).toBe('USER');
    });

    it('should enforce role USER even if client attempts privilege escalation', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker User',
          email: 'another@gdg.com',
          password: 'Password123',
          role: 'ADMIN', // Client maliciously requests ADMIN
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.user.role).toBe('USER'); // Privilege escalation blocked
    });

    it('should return 409 EMAIL_EXISTS when registering an existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should return 422 VALIDATION_ERROR for invalid registration input', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'A', // too short (< 2)
          email: 'not-an-email',
          password: 'plain', // < 8 characters and no number
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(res.body.error.details)).toBe(true);
      expect(res.body.error.details.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log in an existing user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.token).toBeDefined();

      const decoded = jwt.verify(res.body.data.token, config.jwtSecret);
      expect(decoded.id).toBe(res.body.data.user.id);
      expect(decoded.role).toBe('USER');
    });

    it('should return generic 401 on wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword999',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should return the exact same generic 401 on non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ghost@nonexistent.com',
          password: 'Password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should return 422 VALIDATION_ERROR on invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email-format',
          password: 'somepassword',
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/auth/me (Protected Route)', () => {
    let validToken;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      validToken = loginRes.body.data.token;
    });

    it('should return current user profile with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should return 401 UNAUTHORIZED when token is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 INVALID_TOKEN when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.payload');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('Middleware: authorize(...roles)', () => {
    const { authorize } = require('../src/middleware/auth');

    it('should pass if user possesses the required role', () => {
      const middleware = authorize('ADMIN');
      const req = { user: { role: 'ADMIN' } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalledWith();
    });

    it('should return 403 FORBIDDEN if user does not possess the required role', () => {
      const middleware = authorize('ADMIN');
      const req = { user: { role: 'USER' } };
      const res = {};
      const next = jest.fn();

      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
      const err = next.mock.calls[0][0];
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    });
  });
});

