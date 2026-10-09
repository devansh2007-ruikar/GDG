const { z } = require('zod');

// Helper to validate whether a string represents a valid future date
const isFutureDate = (val) => {
  const timestamp = Date.parse(val);
  if (isNaN(timestamp)) return false;
  return new Date(timestamp).getTime() > Date.now();
};

const createEventSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be between 3 and 100 characters')
    .max(100, 'Title must be between 3 and 100 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be between 10 and 2000 characters')
    .max(2000, 'Description must be between 10 and 2000 characters'),
  dateTime: z
    .string({ required_error: 'Date and time are required' })
    .refine(isFutureDate, {
      message: 'dateTime must be a valid future ISO date/time',
    }),
  venue: z
    .string({ required_error: 'Venue is required' })
    .trim()
    .min(1, 'Venue cannot be empty')
    .max(200, 'Venue cannot exceed 200 characters'),
  capacity: z
    .number({ required_error: 'Capacity is required' })
    .int('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity cannot exceed 10,000'),
  category: z
    .string({ required_error: 'Category is required' })
    .trim()
    .min(1, 'Category cannot be empty')
    .max(50, 'Category cannot exceed 50 characters'),
});

const updateEventSchema = createEventSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

const eventQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  from: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'from must be a valid date',
    })
    .optional(),
  to: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'to must be a valid date',
    })
    .optional(),
  upcoming: z.enum(['true', 'false']).optional(),
  sort: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const eventIdParamSchema = z.object({
  id: z.string().trim().min(1, 'Invalid event ID format'),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  eventQuerySchema,
  eventIdParamSchema,
};
