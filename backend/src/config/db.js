const { PrismaClient } = require('@prisma/client');
const config = require('./env');

// PrismaClient is instantiated once to prevent exhausting database connections
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : (process.env.NODE_ENV === 'test' ? [] : ['error']),
});


module.exports = prisma;
