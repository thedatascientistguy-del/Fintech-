const jwt = require('jsonwebtoken');
const { logger } = require('../../../shared/utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.tenantId = decoded.tenantId;
    req.tenantName = decoded.tenantName;
    
    next();
  } catch (error) {
    logger.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
