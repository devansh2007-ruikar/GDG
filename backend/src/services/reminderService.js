const cron = require('node-cron');
const prisma = require('../config/db');

/**
 * Service to dispatch automated event reminders for registrations within 24h
 * Enforces idempotency via the remindedAt database timestamp
 */
const sendUpcomingEventReminders = async () => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Find all unreminded registrations for events happening in the next 24 hours
  const pendingRegistrations = await prisma.registration.findMany({
    where: {
      remindedAt: null,
      event: {
        dateTime: {
          gte: now,
          lte: next24Hours,
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          dateTime: true,
          venue: true,
        },
      },
    },
  });

  if (pendingRegistrations.length === 0) {
    return { remindedCount: 0 };
  }

  console.log(`\n⏰ [CRON REMINDER] Processing ${pendingRegistrations.length} upcoming event reminder(s)...`);

  for (const reg of pendingRegistrations) {
    // 1. Dispatch reminder (simulated delivery via formatted log / email dispatch)
    console.log(
      `📧 [EMAIL DISPATCHED] To: ${reg.user.name} <${reg.user.email}> | ` +
      `Subject: Reminder: "${reg.event.title}" is starting soon! | ` +
      `When: ${new Date(reg.event.dateTime).toLocaleString()} | Venue: ${reg.event.venue}`
    );

    // 2. Mark remindedAt immediately so user is never notified twice
    await prisma.registration.update({
      where: { id: reg.id },
      data: {
        remindedAt: new Date(),
      },
    });
  }

  console.log(`✅ [CRON REMINDER] Successfully dispatched and marked ${pendingRegistrations.length} reminder(s).\n`);

  return { remindedCount: pendingRegistrations.length };
};

/**
 * Initialize hourly background cron job
 * Runs at minute 0 of every hour: '0 * * * *'
 */
const initReminderJob = () => {
  // Do not run background cron loops during unit tests
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  const task = cron.schedule('0 * * * *', async () => {
    try {
      await sendUpcomingEventReminders();
    } catch (err) {
      console.error('❌ Error executing scheduled reminder job:', err);
    }
  });

  console.log('⏰ Scheduled hourly reminder background job initialized (cron: 0 * * * *)');
  return task;
};

module.exports = {
  sendUpcomingEventReminders,
  initReminderJob,
};
