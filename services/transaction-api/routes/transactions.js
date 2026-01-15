const express = require('express');
const router = express.Router();
const Joi = require('joi');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Transaction = require('../../../shared/models/transaction');
const { logger, auditLogger } = require('../../../shared/utils/logger');

// Validation schema
const transactionSchema = Joi.object({
  customerId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().default('PKR'),
  merchantCategory: Joi.string().required(),
  merchantName: Joi.string().required(),
  location: Joi.object({
    lat: Joi.number(),
    lng: Joi.number(),
    city: Joi.string(),
    country: Joi.string()
  }).required(),
  deviceInfo: Joi.object({
    deviceId: Joi.string(),
    ip: Joi.string(),
    userAgent: Joi.string()
  }).required()
});

// Submit transaction
router.post('/', async (req, res) => {
  try {
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const transaction = new Transaction({
      id: uuidv4(),
      tenantId: req.tenantId,
      ...value
    });

    // Log transaction
    await auditLogger.log('transaction_submitted', {
      transactionId: transaction.id,
      tenantId: req.tenantId,
      amount: transaction.amount
    });

    // Send to fraud detection
    const fraudResponse = await axios.post(
      `http://localhost:${process.env.FRAUD_DETECTION_PORT}/api/analyze`,
      transaction.toJSON()
    );

    transaction.fraudScore = fraudResponse.data.fraudScore;

    if (transaction.fraudScore >= (process.env.FRAUD_THRESHOLD || 75)) {
      transaction.status = 'pending_verification';
      
      // Trigger verification
      await axios.post(
        `http://localhost:${process.env.VERIFICATION_SERVICE_PORT}/api/verify`,
        { transactionId: transaction.id }
      );

      logger.info(`Transaction ${transaction.id} flagged for verification`);
    } else {
      transaction.status = 'approved';
    }

    res.json({
      transactionId: transaction.id,
      status: transaction.status,
      fraudScore: transaction.fraudScore
    });

  } catch (error) {
    logger.error('Transaction submission error:', error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

// Get transaction status
router.get('/:id', async (req, res) => {
  try {
    // TODO: Fetch from database
    res.json({ message: 'Transaction status endpoint' });
  } catch (error) {
    logger.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;
