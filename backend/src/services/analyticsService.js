const prisma = require('../config/db');

/**
 * Compute key platform metrics for Admin Dashboard
 * All numbers are computed live directly from the database with 0 hardcoded/mock values.
 */
const getAdminAnalytics = async () => {
  const now = new Date();

  const [
    totalEvents,
    upcomingEvents,
    registeredUsers,
    totalBookings,
    distinctUserRegs,
    allEvents,
  ] = await Promise.all([
    // Total events published on platform
    prisma.event.count(),

    // Events scheduled in the future (dateTime > now)
    prisma.event.count({
      where: {
        dateTime: { gt: now },
      },
    }),

    // Count of registered users with role 'USER'
    prisma.user.count({
      where: {
        role: 'USER',
      },
    }),

    // Total bookings (count of rows in Registration table)
    prisma.registration.count(),

    // Distinct user IDs who have made at least one registration
    prisma.registration.findMany({
      select: { userId: true },
      distinct: ['userId'],
    }),

    // All events to compute accurate fill rates and category distributions
    prisma.event.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        capacity: true,
        registeredCount: true,
        dateTime: true,
      },
    }),
  ]);

  // Unique attendees: count of distinct userIds with at least one registration
  const uniqueAttendees = distinctUserRegs.length;

  // Top 5 events by fill rate (registeredCount / capacity) descending
  const topEvents = allEvents
    .map((e) => {
      const fillRate = e.capacity > 0 ? e.registeredCount / e.capacity : 0;
      return {
        id: e.id,
        title: e.title,
        category: e.category,
        registeredCount: e.registeredCount,
        capacity: e.capacity,
        fillRate: Number(fillRate.toFixed(4)),
        fillPercentage: Math.round(fillRate * 100),
      };
    })
    .sort((a, b) => b.fillRate - a.fillRate || b.registeredCount - a.registeredCount)
    .slice(0, 5);

  // Group registrations by event category, showing EVERY category that has events (including 0)
  const categoryMap = {};
  for (const e of allEvents) {
    if (!(e.category in categoryMap)) {
      categoryMap[e.category] = 0;
    }
    categoryMap[e.category] += e.registeredCount;
  }

  const registrationsByCategory = Object.entries(categoryMap)
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category));

  return {
    totalEvents,
    upcomingEvents,
    registeredUsers,
    totalBookings,
    uniqueAttendees,
    topEvents,
    registrationsByCategory,
    // Backwards compatibility aliases
    totalUsers: registeredUsers,
    totalRegistrations: totalBookings,
  };
};

module.exports = {
  getAdminAnalytics,
};
