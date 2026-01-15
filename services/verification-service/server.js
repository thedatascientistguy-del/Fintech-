require('dotenv').config();
const express = require('express');
const axios = require('axios');
const redis = require('redis');
const { logger, auditLogger } = require('../../shared/utils/logger');
const Encryption = require('../../shared/utils/encryption');

const app = express();
const PORT = process.env.VERIFICATION_SERVICE_PORT || 3002;

app.use(express.json());

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});
redisClient.connect().catch(console.error);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'verification-service' });
});

// Initiate verification
app.post('/api/verify', async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    // TODO: Fetch transaction and customer from DB
    const customer = {
      id: 'cust_123',
      phone: '+923001234567',
      cnicLastTwo: '45' // This would be encrypted in real DB
    };

    // Store verification session
    await redisClient.setEx(`verify:${transactionId}`, 1800, JSON.stringify({
      transactionId,
      customerId: customer.id,
      cnicLastTwo: customer.cnicLastTwo,
      attempts: 0,
      status: 'pending'
    }));

    // Trigger AI voice call
    await axios.post(
      `http://localhost:${process.env.AI_VOICE_AGENT_PORT}/api/call`,
      {
        transactionId,
        phone: customer.phone,
        language: 'urdu'
      }
    );

    await auditLogger.log('verification_initiated', {
      transactionId,
      customerId: customer.id,
      phone: Encryption.maskPhone(customer.phone)
    });

    res.json({ status: 'verification_initiated', transactionId });

  } catch (error) {
    logger.error('Verification initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate verification' });
  }
});

// Verify CNIC
app.post('/api/verify/cnic', async (req, res) => {
  try {
    const { transactionId, cnicInput } = req.body;
    
    const sessionData = await redisClient.get(`verify:${transactionId}`);
    if (!sessionData) {
      return res.status(404).json({ error: 'Verification session not found' });
    }

    const session = JSON.parse(sessionData);
    session.attempts += 1;

    const isCorrect = cnicInput === session.cnicLastTwo;

    if (isCorrect) {
      session.status = 'verified';
      await redisClient.setEx(`verify:${transactionId}`, 1800, JSON.stringify(session));
      
      await auditLogger.log('verification_success', {
        transactionId,
        customerId: session.customerId,
        attempts: session.attempts
      });

      return res.json({ status: 'verified', message: 'Transaction approved' });
    }

    if (session.attempts >= (process.env.MAX_VERIFICATION_ATTEMPTS || 3)) {
      session.status = 'failed';
      await redisClient.setEx(`verify:${transactionId}`, 1800, JSON.stringify(session));
      
      // Block account
      // TODO: Update customer status in DB
      
      await auditLogger.log('verification_failed_blocked', {
        transactionId,
        customerId: session.customerId,
        attempts: session.attempts
      });

      return res.json({ 
        status: 'blocked', 
        message: 'Account temporarily blocked due to failed verification' 
      });
    }

    await redisClient.setEx(`verify:${transactionId}`, 1800, JSON.stringify(session));

    res.json({ 
      status: 'incorrect', 
      attemptsRemaining: (process.env.MAX_VERIFICATION_ATTEMPTS || 3) - session.attempts 
    });

  } catch (error) {
    logger.error('CNIC verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.listen(PORT, () => {
  logger.info(`Verification service running on port ${PORT}`);
});

module.exports = app;
