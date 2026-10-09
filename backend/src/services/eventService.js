const prisma = require('../config/db');
const AppError = require('../utils/appError');

/**
 * Adds computed seatsLeft property to event object
 */
const formatEventWithSeats = (event) => ({
  ...event,
  seatsLeft: Math.max(0, event.capacity - event.registeredCount),
});

/**
 * Retrieve paginated, filtered, and searched events
 */
const getEvents = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const where = {};

  // 1. Text Search across title, description, or venue
  if (query.search) {
    where.OR = [
      { title: { contains: query.search } },
      { description: { contains: query.search } },
      { venue: { contains: query.search } },
    ];
  }

  // 2. Category filtering
  if (query.category) {
    where.category = { equals: query.category };
  }

  // 3. Date range & upcoming filtering
  const dateFilter = {};
  const isUpcoming = query.upcoming !== 'false';

  if (isUpcoming) {
    // Default: only future events from now onwards
    const now = new Date();
    dateFilter.gte = query.from ? new Date(Math.max(new Date(query.from).getTime(), now.getTime())) : now;
  } else if (query.from) {
    dateFilter.gte = new Date(query.from);
  }

  if (query.to) {
    dateFilter.lte = new Date(query.to);
  }

  if (Object.keys(dateFilter).length > 0) {
    where.dateTime = dateFilter;
  }

  // 4. Sorting (default: dateTime asc)
  let orderBy = { dateTime: 'asc' };
  if (query.sort) {
    const sortVal = query.sort.toLowerCase();
    if (sortVal === 'desc' || sortVal === 'datetime:desc' || sortVal === 'datetime_desc') {
      orderBy = { dateTime: 'desc' };
    } else if (sortVal === 'asc' || sortVal === 'datetime:asc' || sortVal === 'datetime_asc') {
      orderBy = { dateTime: 'asc' };
    } else if (sortVal === 'title:asc' || sortVal === 'title:desc') {
      const [field, direction] = sortVal.split(':');
      orderBy = { [field]: direction };
    }
  }

  // Run count and query in parallel for performance
  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
  ]);

  return {
    events: events.map(formatEventWithSeats),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieve unique categories present in the database
 */
const getCategories = async () => {
  const distinctResults = await prisma.event.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  return distinctResults.map((item) => item.category);
};

/**
 * Retrieve single event by ID, optionally calculating registration status for current user
 */
const getEventById = async (id, currentUserId = null) => {
  if (!id) {
    throw new AppError('Event ID is required', 400, 'INVALID_ID');
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!event) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  const formatted = formatEventWithSeats(event);

  // If authenticated user is viewing the event, check if they are already registered
  if (currentUserId) {
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: currentUserId,
          eventId: id,
        },
      },
    });

    formatted.isRegistered = Boolean(existingRegistration);
  }

  return formatted;
};

/**
 * Admin action: Create new event
 */
const createEvent = async (data, creatorId) => {
  const event = await prisma.event.create({
    data: {
      ...data,
      dateTime: new Date(data.dateTime),
      createdById: creatorId,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return formatEventWithSeats(event);
};

/**
 * Admin action: Update event
 * Business rule: Capacity cannot be set below current registeredCount
 */
const updateEvent = async (id, data) => {
  if (!id) {
    throw new AppError('Event ID is required', 400, 'INVALID_ID');
  }

  const existing = await prisma.event.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  // Enforce capacity invariant
  if (data.capacity !== undefined && data.capacity < existing.registeredCount) {
    throw new AppError(
      `Cannot set capacity (${data.capacity}) below existing registrations (${existing.registeredCount})`,
      409,
      'CAPACITY_BELOW_REGISTRATIONS'
    );
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      ...(data.dateTime ? { dateTime: new Date(data.dateTime) } : {}),
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return formatEventWithSeats(updated);
};

/**
 * Admin action: Delete event
 * Registrations are automatically removed via database-level cascade
 */
const deleteEvent = async (id) => {
  if (!id) {
    throw new AppError('Event ID is required', 400, 'INVALID_ID');
  }

  const existing = await prisma.event.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
  }

  await prisma.event.delete({
    where: { id },
  });
};

module.exports = {
  getEvents,
  getCategories,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
