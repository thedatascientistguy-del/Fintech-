const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'fraud_detection',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database schema
const initSchema = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        api_key_hash VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) REFERENCES tenants(id),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        cnic_encrypted TEXT NOT NULL,
        cnic_iv VARCHAR(255) NOT NULL,
        cnic_auth_tag VARCHAR(255) NOT NULL,
        account_status VARCHAR(50) DEFAULT 'active',
        blocked_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) REFERENCES tenants(id),
        customer_id VARCHAR(255) REFERENCES customers(id),
        amount DECIMAL(15, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'PKR',
        merchant_category VARCHAR(100),
        merchant_name VARCHAR(255),
        location JSONB,
        device_info JSONB,
        fraud_score INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        verification_status VARCHAR(50),
        verification_attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_tenant ON transactions(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
    `);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database schema error:', error);
  } finally {
    client.release();
  }
};

module.exports = { pool, initSchema };
