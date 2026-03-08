require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const cron = require('node-cron');

const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const seed = require('./services/seeder');
const { detectOverdue } = require('./services/overdueService');
const logger = require('./utils/logger');
const { connectRedis } = require('./services/redisService');

// Initialize BullMQ worker
require('./workers/reportWorker');

// Route imports
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const loanRoutes = require('./routes/loanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const groupRoutes = require('./routes/groupRoutes');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// HTTP Logging with Winston
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/groups', groupRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Pahel LMS API is running', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error Handler
app.use(errorHandler);

// Connect DB, Redis and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    connectRedis(); // Don't await, let it connect in background

    // Seed initial data
    await seed();

    app.listen(PORT, () => {
      logger.info(`🚀 Pahel LMS Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`📊 API: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api/health`);
    });

    // Cron: detect overdue EMIs daily at midnight
    cron.schedule('0 0 * * *', async () => {
      logger.info('[CRON] Running overdue detection...');
      await detectOverdue();
    });
    process.on('unhandledRejection', (reason) => {
      if (reason && (reason.code === 'ECONNREFUSED' || reason.message?.includes('ECONNREFUSED'))) {
        return; // Silently ignore Redis/Net connection rejections
      }
      logger.error('Unhandled Rejection', reason);
    });

    process.on('uncaughtException', (err) => {
      if (err && (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED'))) {
        return; // Silently ignore Redis/Net connection exceptions
      }
      logger.error('Uncaught Exception', err);
      process.exit(1);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
