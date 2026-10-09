const prisma = require('../config/db');

/**
 * Compute key platform metrics for Admin Dashboard
 */
const getAdminAnalytics = async () => {
  const [totalEvents, totalUsers, totalRegistrations, events] = await Promise.all([
    prisma.event.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.registration.count(),
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

  // Top 5 events by fill rate (registeredCount / capacity)
  const topEvents = events
    .map((e) => {
      const fillRate = e.capacity > 0 ? e.registeredCount / e.capacity : 0;
      return {
        id: e.id,
        title: e.title,
        category: e.category,
        registeredCount: e.registeredCount,
        capacity: e.capacity,
        fillRate: Number(fillRate.toFixed(2)),
        fillPercentage: Math.round(fillRate * 100),
      };
    })
    .sort((a, b) => b.fillRate - a.fillRate)
    .slice(0, 5);

  // Registrations grouped by category
  const categoryMap = {};
  for (const e of events) {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.registeredCount;
  }

  const registrationsByCategory = Object.entries(categoryMap)
    .map(([category, count]) => ({
      category,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalEvents,
    totalUsers,
    totalRegistrations,
    topEvents,
    registrationsByCategory,
  };
};

module.exports = {
  getAdminAnalytics,
};
