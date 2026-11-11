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

// Dynamic CORS configuration
const defaultOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server, Render health probes)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    // Allow if origin is explicitly in allowed list or if wildcard is enabled
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      allowedOrigins.includes('*') ||
      (process.env.CLIENT_URL && normalizedOrigin === process.env.CLIENT_URL.replace(/\/$/, ''))
    ) {
      return callback(null, true);
    }

    // In development mode, permit any localhost / 127.0.0.1 origin regardless of port
    if (
      process.env.NODE_ENV !== 'production' &&
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
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
app.use('/api/scans', historyRoutes);
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
const HOST = process.env.HOST || '0.0.0.0';

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`MailGuard backend server running on http://${HOST}:${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

module.exports = app;
