const axios = require('axios');
const redis = require('redis');
const { logger } = require('../../shared/utils/logger');

class FraudDetector {
  constructor() {
    this.redisClient = redis.createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
    });
    this.redisClient.connect().catch(console.error);
  }

  async analyze(transaction) {
    try {
      // Get customer transaction history
      const history = await this.getCustomerHistory(transaction.customerId);
      
      // Calculate fraud features
      const features = await this.extractFeatures(transaction, history);
      
      // Call ML model (Python service)
      const mlResponse = await axios.post('http://localhost:5000/predict', {
        features
      });
      
      const fraudScore = mlResponse.data.fraud_probability * 100;
      
      // Cache result
      await this.cacheResult(transaction.id, fraudScore);
      
      return Math.round(fraudScore);
      
    } catch (error) {
      logger.error('Fraud analysis error:', error);
      // Fallback to rule-based detection
      return this.ruleBasedDetection(transaction);
    }
  }

  async extractFeatures(transaction, history) {
    const avgAmount = history.length > 0 
      ? history.reduce((sum, t) => sum + t.amount, 0) / history.length 
      : transaction.amount;
    
    const transactionCount24h = history.filter(t => 
      new Date() - new Date(t.timestamp) < 24 * 60 * 60 * 1000
    ).length;

    return {
      amount: transaction.amount,
      amount_deviation: Math.abs(transaction.amount - avgAmount) / (avgAmount || 1),
      transaction_count_24h: transactionCount24h,
      merchant_category: transaction.merchantCategory,
      hour_of_day: new Date(transaction.timestamp).getHours(),
      day_of_week: new Date(transaction.timestamp).getDay(),
      is_weekend: [0, 6].includes(new Date(transaction.timestamp).getDay()) ? 1 : 0,
      device_change: history.length > 0 && history[0].deviceInfo?.deviceId !== transaction.deviceInfo?.deviceId ? 1 : 0,
      location_change: this.calculateLocationChange(transaction, history)
    };
  }

  calculateLocationChange(transaction, history) {
    if (history.length === 0) return 0;
    const lastLocation = history[0].location;
    if (!lastLocation || !transaction.location) return 0;
    
    // Simple distance calculation (Haversine would be better)
    const latDiff = Math.abs(transaction.location.lat - lastLocation.lat);
    const lngDiff = Math.abs(transaction.location.lng - lastLocation.lng);
    return latDiff + lngDiff > 1 ? 1 : 0;
  }

  ruleBasedDetection(transaction) {
    let score = 0;
    
    // High amount
    if (transaction.amount > 100000) score += 30;
    else if (transaction.amount > 50000) score += 20;
    
    // Late night transactions
    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 23 || hour <= 5) score += 25;
    
    // High-risk merchant categories
    const highRiskCategories = ['gambling', 'crypto', 'international'];
    if (highRiskCategories.includes(transaction.merchantCategory)) score += 30;
    
    return Math.min(score, 100);
  }

  async getCustomerHistory(customerId) {
    try {
      const cached = await this.redisClient.get(`history:${customerId}`);
      if (cached) return JSON.parse(cached);
      
      // TODO: Fetch from database
      return [];
    } catch (error) {
      logger.error('Error fetching history:', error);
      return [];
    }
  }

  async cacheResult(transactionId, score) {
    await this.redisClient.setEx(`fraud:${transactionId}`, 3600, score.toString());
  }
}

module.exports = FraudDetector;
