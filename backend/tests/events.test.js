const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Events API (Public & Admin)', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let normalUser;
  let sampleEvent;

  beforeAll(async () => {
    // 1. Authenticate admin user (seeded in Step 1)
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@gdg.com',
        password: 'Admin@123',
      });
    adminToken = adminLogin.body.data.token;
    adminUser = adminLogin.body.data.user;

    // 2. Authenticate normal user (seeded in Step 1)
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user1@gdg.com',
        password: 'User@123',
      });
    userToken = userLogin.body.data.token;
    normalUser = userLogin.body.data.user;

    // 3. Fetch one seeded event
    sampleEvent = await prisma.event.findFirst({
      where: { title: 'Google Cloud & Applied AI Summit' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/events (Public Discovery)', () => {
    it('should return list of events with seatsLeft and pagination metadata', async () => {
      const res = await request(app).get('/api/events');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      // Verify seatsLeft calculation: seatsLeft = capacity - registeredCount
      const firstEvent = res.body.data[0];
      expect(firstEvent.seatsLeft).toBe(firstEvent.capacity - firstEvent.registeredCount);

      // Verify pagination meta
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.total).toBeGreaterThanOrEqual(8);
      expect(res.body.meta.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should filter events by category', async () => {
      const res = await request(app).get('/api/events?category=Workshop');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((evt) => {
        expect(evt.category).toBe('Workshop');
      });
    });

    it('should search events by keywords in title, description, or venue', async () => {
      const res = await request(app).get('/api/events?search=Cloud');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].title).toContain('Cloud');
    });

    it('should paginate results with page and limit parameters', async () => {
      const res = await request(app).get('/api/events?page=1&limit=2');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.limit).toBe(2);
    });
  });

  describe('GET /api/events/categories', () => {
    it('should return distinct event categories', async () => {
      const res = await request(app).get('/api/events/categories');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toContain('Tech');
      expect(res.body.data).toContain('Workshop');
      expect(res.body.data).toContain('Hackathon');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event details with seatsLeft (unauthenticated guest)', async () => {
      const res = await request(app).get(`/api/events/${sampleEvent.id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(sampleEvent.id);
      expect(res.body.data.seatsLeft).toBe(sampleEvent.capacity - sampleEvent.registeredCount);
      expect(res.body.data.isRegistered).toBeUndefined(); // Guest mode
    });

    it('should include isRegistered: false for authenticated user who has not registered', async () => {
      const res = await request(app)
        .get(`/api/events/${sampleEvent.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isRegistered).toBe(false);
    });

    it('should return 404 EVENT_NOT_FOUND for non-existent event ID without server crash', async () => {
      const res = await request(app).get('/api/events/non-existent-uuid-1234');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EVENT_NOT_FOUND');
    });
  });

  describe('POST /api/events (Admin Only)', () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

    it('should block unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Unauthorized Event',
          description: 'Valid long description for testing permissions.',
          dateTime: futureDate,
          venue: 'Room 101',
          capacity: 50,
          category: 'Tech',
        });

      expect(res.statusCode).toBe(401);
    });

    it('should block non-admin users with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Unauthorized Event',
          description: 'Valid long description for testing permissions.',
          dateTime: futureDate,
          venue: 'Room 101',
          capacity: 50,
          category: 'Tech',
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should reject past dateTime with 422 VALIDATION_ERROR', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Past Event',
          description: 'Valid description for testing validation rules.',
          dateTime: pastDate,
          venue: 'Room 101',
          capacity: 50,
          category: 'Tech',
        });

      expect(res.statusCode).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow admin to create an event with 201 Created', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Admin Masterclass',
          description: 'A comprehensive workshop on backend engineering architecture and best practices.',
          dateTime: futureDate,
          venue: 'Auditorium C',
          capacity: 60,
          category: 'Workshop',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Admin Masterclass');
      expect(res.body.data.capacity).toBe(60);
      expect(res.body.data.seatsLeft).toBe(60);
      expect(res.body.data.createdById).toBe(adminUser.id);
    });
  });

  describe('PUT /api/events/:id (Admin Only)', () => {
    let eventToUpdate;

    beforeAll(async () => {
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      eventToUpdate = await prisma.event.create({
        data: {
          title: 'Updatable Event',
          description: 'Detailed description for updating tests.',
          dateTime: futureDate,
          venue: 'Old Hall',
          capacity: 10,
          category: 'Tech',
          registeredCount: 3, // Simulate 3 existing registrations
          createdById: adminUser.id,
        },
      });
    });

    it('should enforce business rule: capacity cannot be lowered below registeredCount -> 409', async () => {
      const res = await request(app)
        .put(`/api/events/${eventToUpdate.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          capacity: 2, // Less than registeredCount (3)
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('CAPACITY_BELOW_REGISTRATIONS');
    });

    it('should allow admin to update venue and valid capacity', async () => {
      const res = await request(app)
        .put(`/api/events/${eventToUpdate.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          venue: 'Updated Grand Ballroom',
          capacity: 25,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.venue).toBe('Updated Grand Ballroom');
      expect(res.body.data.capacity).toBe(25);
      expect(res.body.data.seatsLeft).toBe(22); // 25 - 3
    });
  });

  describe('DELETE /api/events/:id (Admin Only)', () => {
    let eventToDelete;

    beforeAll(async () => {
      const futureDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
      eventToDelete = await prisma.event.create({
        data: {
          title: 'Event To Delete',
          description: 'This event will be deleted via admin endpoint.',
          dateTime: futureDate,
          venue: 'Temporary Hall',
          capacity: 20,
          category: 'Talk',
          createdById: adminUser.id,
        },
      });
    });

    it('should block non-admin from deleting event with 403', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventToDelete.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    it('should allow admin to delete event with 204 No Content', async () => {
      const res = await request(app)
        .delete(`/api/events/${eventToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(204);

      // Verify deletion in subsequent query
      const checkRes = await request(app).get(`/api/events/${eventToDelete.id}`);
      expect(checkRes.statusCode).toBe(404);
      expect(checkRes.body.error.code).toBe('EVENT_NOT_FOUND');
    });
  });
});
