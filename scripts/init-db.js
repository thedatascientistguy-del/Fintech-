require('dotenv').config();
const { initSchema } = require('../shared/config/database');

async function initialize() {
  console.log('🗄️  Initializing database...');
  try {
    await initSchema();
    console.log('✅ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initialize();
