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

// 2. Cross-Origin Resource Sharing (CORS) restricted to client URL
app.use(
  cors({
    origin: config.clientUrl,
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
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
