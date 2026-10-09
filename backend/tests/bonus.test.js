const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/db');
const { sendUpcomingEventReminders } = require('../src/services/reminderService');

describe('Bonus Features: QR Codes, Admin Analytics, and Scheduled Reminders', () => {
  let adminToken;
  let user1Token;
  let user2Token;
  let user1;
  let user2;
  let testEvent;
  let testRegistration;

  beforeAll(async () => {
    // 1. Authenticate users
    const [adminRes, u1Res, u2Res] = await Promise.all([
      request(app).post('/api/auth/login').send({ email: 'admin@gdg.com', password: 'Admin@123' }),
      request(app).post('/api/auth/login').send({ email: 'user1@gdg.com', password: 'User@123' }),
      request(app).post('/api/auth/login').send({ email: 'user2@gdg.com', password: 'User@123' }),
    ]);

    adminToken = adminRes.body.data.token;
    user1Token = u1Res.body.data.token;
    user2Token = u2Res.body.data.token;
    user1 = u1Res.body.data.user;
    user2 = u2Res.body.data.user;

    // 2. Create test event starting in 12 hours (within 24h window)
    const in12Hours = new Date(Date.now() + 12 * 60 * 60 * 1000);
    testEvent = await prisma.event.create({
      data: {
        title: 'Imminent Workshop on Cloud Security',
        description: 'Testing 24h reminder window and digital QR passes.',
        dateTime: in12Hours,
        venue: 'Room 302',
        capacity: 25,
        registeredCount: 1,
        category: 'Tech',
        createdById: adminRes.body.data.user.id,
      },
    });

    // 3. Register user1 for testEvent
    testRegistration = await prisma.registration.create({
      data: {
        userId: user1.id,
        eventId: testEvent.id,
      },
    });
  });

  afterAll(async () => {
    if (testRegistration) {
      await prisma.registration.deleteMany({ where: { eventId: testEvent.id } });
      await prisma.event.delete({ where: { id: testEvent.id } });
    }
    await prisma.$disconnect();
  });

  describe('Bonus 1: QR Code Tickets (GET /api/registrations/:id/qr)', () => {
    it('should generate and return a base64 Data URL QR ticket for the registration owner', async () => {
      const res = await request(app)
        .get(`/api/registrations/${testRegistration.id}/qr`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registrationId).toBe(testRegistration.id);
      expect(res.body.data.qrCode).toMatch(/^data:image\/png;base64,/);
      expect(res.body.data.event.title).toBe(testEvent.title);
      expect(res.body.data.attendee.name).toBe(user1.name);
    });

    it('should block another normal user from viewing someone elses ticket QR code with 403', async () => {
      const res = await request(app)
        .get(`/api/registrations/${testRegistration.id}/qr`)
        .set('Authorization', `Bearer ${user2Token}`); // User2 is NOT the owner

      expect(res.statusCode).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow an administrator to view any attendee ticket QR code with 200', async () => {
      const res = await request(app)
        .get(`/api/registrations/${testRegistration.id}/qr`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.qrCode).toBeDefined();
    });
  });

  describe('Bonus 2: Admin Analytics (GET /api/admin/analytics)', () => {
    it('should block non-admin users from accessing analytics with 403 FORBIDDEN', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.statusCode).toBe(403);
    });

    it('should return aggregated platform analytics for administrator', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.totalEvents).toBe('number');
      expect(typeof res.body.data.totalUsers).toBe('number');
      expect(typeof res.body.data.totalRegistrations).toBe('number');
      expect(typeof res.body.data.registeredUsers).toBe('number');
      expect(typeof res.body.data.totalBookings).toBe('number');
      expect(typeof res.body.data.uniqueAttendees).toBe('number');
      expect(typeof res.body.data.upcomingEvents).toBe('number');
      expect(Array.isArray(res.body.data.topEvents)).toBe(true);
      expect(Array.isArray(res.body.data.registrationsByCategory)).toBe(true);
    });
  });

  describe('Bonus 3: Reminders Background Job & Idempotency', () => {
    it('should dispatch reminder for events starting within 24h and set remindedAt to avoid duplicate reminders', async () => {
      // 1. Run reminder job
      const run1 = await sendUpcomingEventReminders();
      expect(run1.remindedCount).toBeGreaterThanOrEqual(1);

      // Verify remindedAt is now set in DB
      const updatedReg = await prisma.registration.findUnique({
        where: { id: testRegistration.id },
      });
      expect(updatedReg.remindedAt).not.toBeNull();

      // 2. Run reminder job second time -> should NOT remind again
      const run2 = await sendUpcomingEventReminders();
      // testRegistration is already reminded, so count for it is 0
      const recheckedReg = await prisma.registration.findUnique({
        where: { id: testRegistration.id },
      });
      expect(recheckedReg.remindedAt.getTime()).toBe(updatedReg.remindedAt.getTime());
    });
  });
});
