const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/db');
const config = require('../src/config/env');

describe('High-Concurrency Registration Test (20 Users vs 5 Seats)', () => {
  let createdUsers = [];
  let userTokens = [];
  let stressEvent;

  beforeAll(async () => {
    // 1. Pre-compute hash once to optimize test setup speed
    const passwordHash = await bcrypt.hash('TestPass@123', 10);

    // 2. Provision 20 distinct users
    const userCreates = [];
    for (let i = 1; i <= 20; i++) {
      userCreates.push(
        prisma.user.create({
          data: {
            name: `Stress User ${i}`,
            email: `stress_user_${Date.now()}_${i}@gdg.com`,
            passwordHash,
            role: 'USER',
          },
        })
      );
    }
    createdUsers = await Promise.all(userCreates);

    // 3. Generate valid JWT tokens for all 20 users
    userTokens = createdUsers.map((user) =>
      jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
      })
    );

    // 4. Create an event with strictly capacity = 5
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    stressEvent = await prisma.event.create({
      data: {
        title: 'High-Throughput Concurrency Summit',
        description: 'Rigorous concurrency test: 20 simultaneous users racing for strictly 5 available seats.',
        dateTime: futureDate,
        venue: 'Distributed Systems Hall',
        capacity: 5,
        registeredCount: 0,
        category: 'Tech',
        createdById: createdUsers[0].id,
      },
    });
  });

  afterAll(async () => {
    if (stressEvent) {
      await prisma.registration.deleteMany({ where: { eventId: stressEvent.id } });
      await prisma.event.delete({ where: { id: stressEvent.id } });
    }
    const userIds = createdUsers.map((u) => u.id);
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.$disconnect();
  });

  it('should process 20 simultaneous registrations: exactly 5 succeed (201) and 15 fail with 409 EVENT_FULL', async () => {
    // Fire all 20 registration requests simultaneously using Promise.all
    const registrationPromises = userTokens.map((token) =>
      request(app)
        .post(`/api/events/${stressEvent.id}/register`)
        .set('Authorization', `Bearer ${token}`)
    );

    const responses = await Promise.all(registrationPromises);

    // Filter responses by status code
    const successes = responses.filter((r) => r.statusCode === 201);
    const eventFullErrors = responses.filter(
      (r) => r.statusCode === 409 && r.body.error?.code === 'EVENT_FULL'
    );

    // Assertions requested in specification:
    // 1. Exactly 5 succeed with 201
    expect(successes.length).toBe(5);

    // 2. Exactly 15 get rejected with 409 EVENT_FULL
    expect(eventFullErrors.length).toBe(15);

    // 3. Assert registeredCount in DB strictly equals 5
    const eventInDb = await prisma.event.findUnique({
      where: { id: stressEvent.id },
    });
    expect(eventInDb.registeredCount).toBe(5);

    // 4. Verify actual registration records in the DB also match exactly 5
    const registrationCountInDb = await prisma.registration.count({
      where: { eventId: stressEvent.id },
    });
    expect(registrationCountInDb).toBe(5);
  });
});
