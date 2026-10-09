const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/db');

const { initReminderJob } = require('./services/reminderService');

const server = app.listen(config.port, () => {
  console.log(`🚀 GDG Event Management Server running on port ${config.port} (${config.nodeEnv})`);
  console.log(`📑 Swagger docs available at http://localhost:${config.port}/api/docs`);
  console.log(`❤️  Health check available at http://localhost:${config.port}/api/health`);
  initReminderJob();
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Database connections closed. Process terminating.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
