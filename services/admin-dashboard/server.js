require('dotenv').config();
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const { logger } = require('../../shared/utils/logger');

const app = express();
const PORT = process.env.ADMIN_DASHBOARD_PORT || 3004;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let mongoClient;
let auditCollection;

// Connect to MongoDB
async function connectDB() {
  mongoClient = new MongoClient(process.env.MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db();
  auditCollection = db.collection('audit_logs');
  logger.info('Connected to MongoDB');
}

connectDB().catch(console.error);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'admin-dashboard' });
});

// Dashboard home
app.get('/', async (req, res) => {
  try {
    const stats = await getStats();
    res.render('dashboard', { stats });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).send('Error loading dashboard');
  }
});

// Transactions page
app.get('/transactions', async (req, res) => {
  try {
    const transactions = await auditCollection
      .find({ event: 'transaction_submitted' })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    res.render('transactions', { transactions });
  } catch (error) {
    logger.error('Transactions page error:', error);
    res.status(500).send('Error loading transactions');
  }
});

// Verification logs
app.get('/verifications', async (req, res) => {
  try {
    const verifications = await auditCollection
      .find({ 
        event: { $in: ['verification_initiated', 'verification_success', 'verification_failed_blocked'] }
      })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    
    res.render('verifications', { verifications });
  } catch (error) {
    logger.error('Verifications page error:', error);
    res.status(500).send('Error loading verifications');
  }
});

// API: Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (error) {
    logger.error('Stats API error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

async function getStats() {
  const now = new Date();
  const last24h = new Date(now - 24 * 60 * 60 * 1000);
  
  const totalTransactions = await auditCollection.countDocuments({
    event: 'transaction_submitted',
    timestamp: { $gte: last24h }
  });
  
  const verificationInitiated = await auditCollection.countDocuments({
    event: 'verification_initiated',
    timestamp: { $gte: last24h }
  });
  
  const verificationSuccess = await auditCollection.countDocuments({
    event: 'verification_success',
    timestamp: { $gte: last24h }
  });
  
  const accountsBlocked = await auditCollection.countDocuments({
    event: 'verification_failed_blocked',
    timestamp: { $gte: last24h }
  });
  
  const fraudRate = totalTransactions > 0 
    ? ((verificationInitiated / totalTransactions) * 100).toFixed(2)
    : 0;
  
  const verificationSuccessRate = verificationInitiated > 0
    ? ((verificationSuccess / verificationInitiated) * 100).toFixed(2)
    : 0;
  
  return {
    totalTransactions,
    verificationInitiated,
    verificationSuccess,
    accountsBlocked,
    fraudRate,
    verificationSuccessRate
  };
}

app.listen(PORT, () => {
  logger.info(`Admin Dashboard running on port ${PORT}`);
});

module.exports = app;
