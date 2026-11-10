const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const scanRoutes = require('./routes/scanRoutes');
const historyRoutes = require('./routes/historyRoutes');
const { requireAuth, optionalAuth } = require('./middlewares/authMiddleware');

const app = express();

// Security HTTP headers
app.use(helmet());

// Logging
app.use(morgan('dev'));

// CORS configuration
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // In non-production, permit any localhost origin
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

// JSON request body parser
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mount application routes
app.use('/api/scan', scanRoutes);
app.use('/api/history', historyRoutes);

// Auth test routes to verify middleware behavior
app.get('/api/test/protected', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to protected route',
    user: req.user,
  });
});

app.get('/api/test/optional', optionalAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Access granted to optional route',
    authenticated: Boolean(req.user),
    user: req.user,
  });
});

// 404 Route Not Found middleware
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.status || (err.message && err.message.includes('CORS') ? 403 : 500);

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred.',
  });
});

// Start HTTP server
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`MailGuard backend server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
