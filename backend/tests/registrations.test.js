const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');

describe('Event Registration API & Concurrency Control', () => {
  let adminToken;
  let user1Token;
  let user2Token;
  let user1Id;
  let user2Id;
  let singleSeatEvent;
  let multiSeatEvent;
  let pastEvent;

  beforeAll(async () => {
    // 1. Authenticate users
    const [adminLogin, user1Login, user2Login] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: 'admin@gdg.com', password: 'Admin@123' }),
      request(app).post('/api/auth/login').send({ email: 'user1@gdg.com', password: 'User@123' }),
      request(app).post('/api/auth/login').send({ email: 'user2@gdg.com', password: 'User@123' }),
    ]);

    adminToken = adminLogin.body.data.token;
    user1Token = user1Login.body.data.token;
    user2Token = user2Login.body.data.token;
    user1Id = user1Login.body.data.user.id;
    user2Id = user2Login.body.data.user.id;

    // 2. Locate or create single seat event (capacity: 1)
    singleSeatEvent = await prisma.event.findFirst({
      where: { title: 'Exclusive Hands-on Agentic AI Masterclass' },
    });

    // 3. Create a multi-seat future event for standard tests
    const futureDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    multiSeatEvent = await prisma.event.create({
      data: {
        title: 'Multi-seat Concurrency Test Event',
        description: 'Used for validating standard registration, duplicate protection, and unregister flows.',
        dateTime: futureDate,
        venue: 'Lab Alpha',
        capacity: 10,
        category: 'Tech',
        createdById: adminLogin.body.data.user.id,
      },
    });

    // 4. Create an event in the past to test past-event business rules
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    pastEvent = await prisma.event.create({
      data: {
        title: 'Historical Past Tech Symposium',
        description: 'This event took place in the past to test guardrails against registering/unregistering.',
        dateTime: pastDate,
        venue: 'Old Hall',
        capacity: 50,
        category: 'Talk',
        createdById: adminLogin.body.data.user.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up created test data
    await prisma.registration.deleteMany({
      where: {
        eventId: {
          in: [multiSeatEvent.id, pastEvent.id, singleSeatEvent ? singleSeatEvent.id : ''],
        },
      },
    });
    await prisma.event.deleteMany({
      where: { id: { in: [multiSeatEvent.id, pastEvent.id] } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/events/:id/register (Business Rules)', () => {
    it('should block unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app).post(`/api/events/${multiSeatEvent.id}/register`);
      expect(res.statusCode).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 EVENT_NOT_FOUND for non-existent event', async () => {
      const res = await request(app)
        .post('/api/events/non-existent-event-id/register')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('EVENT_NOT_FOUND');
    });

    it('should reject registration for past events with 400 EVENT_ALREADY_STARTED', async () => {
      const res = await request(app)
        .post(`/api/events/${pastEvent.id}/register`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('EVENT_ALREADY_STARTED');
    });

    it('should successfully register an authenticated user with 201 Created and increment registeredCount', async () => {
      const res = await request(app)
        .post(`/api/events/${multiSeatEvent.id}/register`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.userId).toBe(user1Id);
      expect(res.body.data.eventId).toBe(multiSeatEvent.id);

      // Verify registeredCount was incremented
      const updatedEvent = await prisma.event.findUnique({ where: { id: multiSeatEvent.id } });
      expect(updatedEvent.registeredCount).toBe(1);
    });

    it('should return 409 ALREADY_REGISTERED on duplicate registration attempt and not double-increment', async () => {
      const res = await request(app)
        .post(`/api/events/${multiSeatEvent.id}/register`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ALREADY_REGISTERED');

      // Verify count remained 1 (rollback verified)
      const updatedEvent = await prisma.event.findUnique({ where: { id: multiSeatEvent.id } });
      expect(updatedEvent.registeredCount).toBe(1);
    });
  });

  describe('Capacity Enforcement & Concurrency Safety', () => {
    it('should enforce capacity: return 409 EVENT_FULL when capacity is reached', async () => {
      // Clean single seat event registrations if any
      await prisma.registration.deleteMany({ where: { eventId: singleSeatEvent.id } });
      await prisma.event.update({ where: { id: singleSeatEvent.id }, data: { registeredCount: 0 } });

      // User 1 claims the 1 available seat
      const res1 = await request(app)
        .post(`/api/events/${singleSeatEvent.id}/register`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res1.statusCode).toBe(201);

      // User 2 attempts to register for the same 1-seat event
      const res2 = await request(app)
        .post(`/api/events/${singleSeatEvent.id}/register`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res2.statusCode).toBe(409);
      expect(res2.body.error.code).toBe('EVENT_FULL');

      // Verify event registeredCount is capped strictly at 1
      const eventState = await prisma.event.findUnique({ where: { id: singleSeatEvent.id } });
      expect(eventState.registeredCount).toBe(1);
    });

    it('concurrent race condition simulation: only 1 winner for a 1-seat event', async () => {
      // Create fresh dedicated 1-capacity event
      const raceEvent = await prisma.event.create({
        data: {
          title: 'Race Condition Test Arena',
          description: 'Testing simultaneous requests vying for the final seat.',
          dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          venue: 'Virtual Arena',
          capacity: 1,
          registeredCount: 0,
          category: 'Workshop',
          createdById: user1Id,
        },
      });

      // Fire concurrent registration requests in parallel
      const [responseA, responseB] = await Promise.all([
        request(app)
          .post(`/api/events/${raceEvent.id}/register`)
          .set('Authorization', `Bearer ${user1Token}`),
        request(app)
          .post(`/api/events/${raceEvent.id}/register`)
          .set('Authorization', `Bearer ${user2Token}`),
      ]);

      const statusCodes = [responseA.statusCode, responseB.statusCode];
      expect(statusCodes).toContain(201); // Exactly one succeeded
      expect(statusCodes).toContain(409); // Exactly one was rejected

      const rejectedResponse = responseA.statusCode === 409 ? responseA : responseB;
      expect(rejectedResponse.body.error.code).toBe('EVENT_FULL');

      // Database integrity assertion: registeredCount MUST NOT exceed capacity
      const finalState = await prisma.event.findUnique({ where: { id: raceEvent.id } });
      expect(finalState.registeredCount).toBe(1);

      // Cleanup
      await prisma.registration.deleteMany({ where: { eventId: raceEvent.id } });
      await prisma.event.delete({ where: { id: raceEvent.id } });
    });
  });

  describe('DELETE /api/events/:id/register (Unregister)', () => {
    it('should return 404 NOT_REGISTERED if user is not registered', async () => {
      const res = await request(app)
        .delete(`/api/events/${multiSeatEvent.id}/register`)
        .set('Authorization', `Bearer ${user2Token}`); // User2 never registered for multiSeatEvent

      expect(res.statusCode).toBe(404);
      expect(res.body.error.code).toBe('NOT_REGISTERED');
    });

    it('should return 400 EVENT_ALREADY_STARTED when attempting to unregister from past event', async () => {
      // Force insert a past registration directly into DB
      const pastReg = await prisma.registration.create({
        data: {
          userId: user1Id,
          eventId: pastEvent.id,
        },
      });

      const res = await request(app)
        .delete(`/api/events/${pastEvent.id}/register`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('EVENT_ALREADY_STARTED');

      // Cleanup past registration
      await prisma.registration.delete({ where: { id: pastReg.id } });
    });

    it('should successfully unregister, decrement registeredCount, and return 204 No Content', async () => {
      // User 1 was registered for multiSeatEvent (count = 1)
      const res = await request(app)
        .delete(`/api/events/${multiSeatEvent.id}/register`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(204);

      // Verify registration row deleted
      const checkReg = await prisma.registration.findUnique({
        where: {
          userId_eventId: {
            userId: user1Id,
            eventId: multiSeatEvent.id,
          },
        },
      });
      expect(checkReg).toBeNull();

      // Verify registeredCount decremented back to 0
      const checkEvent = await prisma.event.findUnique({ where: { id: multiSeatEvent.id } });
      expect(checkEvent.registeredCount).toBe(0);
    });
  });

  describe('GET /api/users/me/registrations', () => {
    beforeAll(async () => {
      // Register user1 for multiSeatEvent
      await request(app)
        .post(`/api/events/${multiSeatEvent.id}/register`)
        .set('Authorization', `Bearer ${user1Token}`);
    });

    it('should return user registrations with event details sorted upcoming first', async () => {
      const res = await request(app)
        .get('/api/users/me/registrations')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const firstReg = res.body.data[0];
      expect(firstReg.event).toBeDefined();
      expect(firstReg.event.title).toBe(multiSeatEvent.title);
      expect(firstReg.event.seatsLeft).toBeDefined();
    });
  });

  describe('GET /api/events/:id/registrations (Admin Only)', () => {
    it('should block non-admin users with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get(`/api/events/${multiSeatEvent.id}/registrations`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow admin to view attendees (name, email, registeredAt)', async () => {
      const res = await request(app)
        .get(`/api/events/${multiSeatEvent.id}/registrations`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const attendee = res.body.data[0];
      expect(attendee.userId).toBe(user1Id);
      expect(attendee.name).toBeDefined();
      expect(attendee.email).toBeDefined();
      expect(attendee.registeredAt).toBeDefined();
    });
  });
});
