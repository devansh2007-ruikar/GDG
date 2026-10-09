const request = require('supertest');
const app = require('../src/app');

describe('System & Health Check API', () => {
  it('GET / should redirect to /api/docs with 302', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/api/docs');
  });

  it('GET /api should return 200 and friendly API index payload', async () => {
    const res = await request(app).get('/api');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual({
      name: 'GDG Event Management & Registration API',
      version: '1.0.0',
      author: 'Devansh Ruikar',
      status: 'running',
      docs: '/api/docs',
      health: '/api/health',
      endpoints: {
        auth: '/api/auth',
        events: '/api/events',
        myRegistrations: '/api/users/me/registrations',
      },
      frontend: 'https://gdg-iota-inky.vercel.app',
    });
  });

  it('GET /api/health should return status 200 and operational payload', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /api/non-existent-route should return 404 with standard error format', async () => {
    const res = await request(app).get('/api/non-existent-route');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

