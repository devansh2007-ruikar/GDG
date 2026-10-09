const request = require('supertest');
const app = require('../src/app');

describe('Health Check API', () => {
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
