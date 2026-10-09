const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const swaggerDocument = require('./docs/swagger.json');

const app = express();

// 1. Security HTTP headers
app.use(helmet());

// 2. Cross-Origin Resource Sharing (CORS) allowing client URL from CLIENT_URL env
const getAllowedOrigins = () => {
  const defaultOrigins = ['http://localhost:5173', 'http://localhost:3000'];
  if (!config.clientUrl) return defaultOrigins;

  const envOrigins = config.clientUrl
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  return Array.from(new Set([...envOrigins, ...defaultOrigins]));
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Swagger UI)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, '');
      const allowedOrigins = getAllowedOrigins();
      if (allowedOrigins.includes('*') || allowedOrigins.includes(cleanOrigin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

// 3. Request Logging (skip during automated tests to keep test output clean)
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// 4. Body parser
app.use(express.json());

// 5. API Documentation
const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerUiOptions));

// Root redirect to Swagger UI
app.get('/', (req, res) => {
  return res.redirect('/api/docs');
});

// 6. API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);

// 7. Unmatched Route Handler (404)
app.use(notFound);

// 8. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
