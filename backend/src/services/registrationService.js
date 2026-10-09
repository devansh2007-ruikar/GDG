/**
 * =====================================================================================================
 * CONCURRENCY & RACE CONDITION ARCHITECTURE NOTE
 * =====================================================================================================
 * 
 * 1. THE PROBLEM: Why "check count, then insert" fails under concurrency (Time-of-Check to Time-of-Use):
 * -----------------------------------------------------------------------------------------------------
 * In a naive implementation:
 *    Step A: SELECT event WHERE id = :id (read registeredCount, say 99 out of 100).
 *    Step B: IF registeredCount < capacity THEN
 *    Step C:   INSERT INTO Registration (userId, eventId)
 *    Step D:   UPDATE Event SET registeredCount = registeredCount + 1
 * 
 * If 10 requests hit the server concurrently when only 1 seat remains:
 * All 10 requests execute Step A simultaneously. All 10 see registeredCount = 99 (< 100).
 * All 10 proceed to Step C & D.
 * Result: The event is oversold to 109 / 100 capacity! This is a classic race condition (TOCTOU).
 * 
 * 2. THE SOLUTION: Atomic conditional update + Unique constraints + ACID Transaction:
 * -----------------------------------------------------------------------------------------------------
 * A) Atomic Conditional Decrement/Increment:
 *    We execute an UPDATE with a WHERE clause that checks capacity directly inside the database engine:
 *      UPDATE "Event" 
 *      SET "registeredCount" = "registeredCount" + 1 
 *      WHERE "id" = :id AND "registeredCount" < "capacity";
 *    
 *    Relational database engines (SQLite, PostgreSQL, MySQL) acquire a row-level write lock for UPDATE.
 *    If 10 requests race for the final seat:
 *      - Exactly ONE transaction wins the lock, increments count to 100, and returns rows_affected = 1.
 *      - The remaining 9 evaluate against count = 100, fail the condition (100 < 100 is FALSE), 
 *        and return rows_affected = 0.
 *      - We check the affected row count: if 0, we immediately abort with 409 EVENT_FULL.
 * 
 * B) Database Unique Constraint (@@unique([userId, eventId])):
 *    Even if the same user fires multiple simultaneous clicks, the database unique index
 *    rejects duplicates (Prisma error P2002).
 * 
 * C) ACID Transaction (prisma.$transaction):
 *    If the registration insert fails (e.g. duplicate user P2002), the transaction rolls back,
 *    automatically undoing the seat increment and keeping registeredCount strictly consistent.
 * =====================================================================================================
 */

const prisma = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Register current user for an event
 * Wrapped in an atomic prisma.$transaction to guarantee capacity integrity and prevent race conditions.
 */
const registerForEvent = async (userId, eventId) => {
  if (!eventId) {
    throw new AppError('Event ID is required', 400, 'INVALID_ID');
  }

  return await prisma.$transaction(
    async (tx) => {
      // 1. Atomically claim a seat:
    // Only increments if event is in the future AND registeredCount is strictly less than capacity.
    // Performing the conditional write immediately prevents read-lock to write-lock upgrade deadlocks in concurrent database transactions.
    const seatClaimResult = await tx.event.updateMany({
      where: {
        id: eventId,
        dateTime: { gt: new Date() },
        registeredCount: {
          lt: tx.event.fields.capacity,
        },
      },
      data: {
        registeredCount: {
          increment: 1,
        },
      },
    });

    // If 0 rows were updated, determine specific business failure reason:
    if (seatClaimResult.count === 0) {
      const event = await tx.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
      }

      if (new Date(event.dateTime).getTime() <= Date.now()) {
        throw new AppError('Cannot register for an event that has already started or concluded', 400, 'EVENT_ALREADY_STARTED');
      }

      throw new AppError('This event is fully booked', 409, 'EVENT_FULL');
    }

    // 2. Create Registration row
    // The database @@unique([userId, eventId]) constraint prevents duplicate registrations.
    // If P2002 is thrown, the transaction rolls back and reverts the seat increment.
    try {
      const registration = await tx.registration.create({
        data: {
          userId,
          eventId,
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              dateTime: true,
              venue: true,
              capacity: true,
              registeredCount: true,
              category: true,
            },
          },
        },
      });

      return registration;
    } catch (err) {
      if (err.code === 'P2002') {
        // Unique constraint violation (duplicate registration)
        throw new AppError('You are already registered for this event', 409, 'ALREADY_REGISTERED');
      }
      throw err;
    }
  }, {
    maxWait: 15000, // Wait up to 15s for database write locks during high concurrency spikes
    timeout: 15000,
  });
};

/**
 * Unregister current user from an event
 * Wrapped in an atomic prisma.$transaction
 */
const unregisterFromEvent = async (userId, eventId) => {
  if (!eventId) {
    throw new AppError('Event ID is required', 400, 'INVALID_ID');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Locate registration along with event details
    const registration = await tx.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      include: {
        event: true,
      },
    });

    if (!registration) {
      throw new AppError('You are not registered for this event', 404, 'NOT_REGISTERED');
    }

    // 2. Verify event has not already started or passed
    const now = new Date();
    if (new Date(registration.event.dateTime).getTime() <= now.getTime()) {
      throw new AppError('Cannot unregister from an event that has already started or concluded', 400, 'EVENT_ALREADY_STARTED');
    }

    // 3. Delete registration record
    await tx.registration.delete({
      where: { id: registration.id },
    });

    // 4. Decrement registeredCount by 1
    await tx.event.update({
      where: { id: eventId },
      data: {
        registeredCount: {
          decrement: 1,
        },
      },
    });
  }, {
    maxWait: 15000,
    timeout: 15000,
  });
};

/**
 * Get current user's registrations (upcoming first, then past)
 */
const getUserRegistrations = async (userId) => {
  const registrations = await prisma.registration.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const now = new Date().getTime();
  const upcoming = [];
  const past = [];

  for (const reg of registrations) {
    const formatted = {
      id: reg.id,
      registeredAt: reg.createdAt,
      event: {
        ...reg.event,
        seatsLeft: Math.max(0, reg.event.capacity - reg.event.registeredCount),
      },
    };

    if (new Date(reg.event.dateTime).getTime() >= now) {
      upcoming.push(formatted);
    } else {
      past.push(formatted);
    }
  }

  // Upcoming sorted chronologically ascending (earliest upcoming first)
  upcoming.sort((a, b) => new Date(a.event.dateTime) - new Date(b.event.dateTime));
  // Past sorted reverse chronologically descending (most recently ended first)
  past.sort((a, b) => new Date(b.event.dateTime) - new Date(a.event.dateTime));

  return [...upcoming, ...past];
};

/**
 * Admin: Get list of attendees for an event
 */
const getEventAttendees = async (eventId) => {
  if (!eventId) {
    throw new AppError('Event ID is required', 400, 'INVALID_ID');
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  const registrations = await prisma.registration.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return registrations.map((r) => ({
    registrationId: r.id,
    userId: r.user.id,
    name: r.user.name,
    email: r.user.email,
    registeredAt: r.createdAt,
  }));
};

/**
 * Generate QR code ticket for a registration
 * Security rule: Only the ticket owner or an ADMIN can view the QR code
 */
const getRegistrationQR = async (registrationId, requestingUser) => {
  const QRCode = require('qrcode');

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          dateTime: true,
          venue: true,
          category: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!registration) {
    throw new AppError('Registration ticket not found', 404, 'REGISTRATION_NOT_FOUND');
  }

  // Authorization check: owner or ADMIN
  if (requestingUser.role !== 'ADMIN' && registration.userId !== requestingUser.id) {
    throw new AppError('You do not have permission to access this ticket', 403, 'FORBIDDEN');
  }

  const qrPayload = JSON.stringify({
    ticketId: registration.id,
    eventId: registration.event.id,
    eventTitle: registration.event.title,
    attendeeName: registration.user.name,
    attendeeEmail: registration.user.email,
    dateTime: registration.event.dateTime,
    issuedAt: registration.createdAt,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 280,
  });

  return {
    registrationId: registration.id,
    qrCode: qrCodeDataUrl,
    event: registration.event,
    attendee: registration.user,
  };
};

module.exports = {
  registerForEvent,
  unregisterFromEvent,
  getUserRegistrations,
  getEventAttendees,
  getRegistrationQR,
};
