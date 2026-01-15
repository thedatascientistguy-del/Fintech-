const winston = require('winston');
const { MongoClient } = require('mongodb');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// MongoDB transport for audit logs
class AuditLogger {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  async connect() {
    if (!this.client) {
      this.client = new MongoClient(process.env.MONGO_URI);
      await this.client.connect();
      this.db = this.client.db();
      this.collection = this.db.collection('audit_logs');
    }
  }

  async log(event, data) {
    await this.connect();
    await this.collection.insertOne({
      event,
      data,
      timestamp: new Date()
    });
  }
}

const auditLogger = new AuditLogger();

module.exports = { logger, auditLogger };
