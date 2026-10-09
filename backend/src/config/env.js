const dotenv = require('dotenv');
const path = require('path');

// Select appropriate environment file
const isTest = process.env.NODE_ENV === 'test';
const envFile = isTest ? '../../.env.test' : '../../.env';

dotenv.config({ path: path.resolve(__dirname, envFile), quiet: true });

const config = {
  port: parseInt(process.env.PORT, 10) || (isTest ? 5001 : 5000),
  databaseUrl: process.env.DATABASE_URL || (isTest ? 'file:./test.db' : 'file:./dev.db'),
  jwtSecret: process.env.JWT_SECRET || 'gdg-default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = config;
