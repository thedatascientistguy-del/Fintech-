require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const transactionRoutes = require('./routes/transactions');
const authMiddleware = require('./middleware/auth');
const { logger } = require('../../shared/utils/logger');

const app = express();
const PORT = process.env.TRANSACTION_API_PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'transaction-api' });
});

// Routes
app.use('/api/transactions', authMiddleware, transactionRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  logger.info(`Transaction API running on port ${PORT}`);
});

module.exports = app;
