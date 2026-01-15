require('dotenv').config();
const express = require('express');
const FraudDetector = require('./fraudDetector');
const { logger } = require('../../shared/utils/logger');

const app = express();
const PORT = process.env.FRAUD_DETECTION_PORT || 3001;

app.use(express.json());

const fraudDetector = new FraudDetector();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'fraud-detection' });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const transaction = req.body;
    const fraudScore = await fraudDetector.analyze(transaction);
    
    logger.info(`Fraud analysis: Transaction ${transaction.id}, Score: ${fraudScore}`);
    
    res.json({
      transactionId: transaction.id,
      fraudScore,
      isFraudulent: fraudScore >= (process.env.FRAUD_THRESHOLD || 75)
    });
  } catch (error) {
    logger.error('Fraud detection error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.listen(PORT, () => {
  logger.info(`Fraud Detection service running on port ${PORT}`);
});

module.exports = app;
