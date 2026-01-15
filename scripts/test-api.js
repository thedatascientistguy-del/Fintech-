const axios = require('axios');
const jwt = require('jsonwebtoken');

// Generate test JWT token
const token = jwt.sign(
  { tenantId: 'test_bank_1', tenantName: 'Test Bank' },
  process.env.JWT_SECRET || 'test_secret',
  { expiresIn: '24h' }
);

const API_URL = 'http://localhost:3000';

async function testTransaction(fraudulent = false) {
  const transaction = fraudulent ? {
    customerId: 'cust_fraud_test',
    amount: 250000, // High amount
    currency: 'PKR',
    merchantCategory: 'gambling', // High-risk category
    merchantName: 'Online Casino',
    location: {
      lat: 33.6844,
      lng: 73.0479,
      city: 'Islamabad',
      country: 'Pakistan'
    },
    deviceInfo: {
      deviceId: 'new_device_123',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0'
    }
  } : {
    customerId: 'cust_normal_test',
    amount: 5000, // Normal amount
    currency: 'PKR',
    merchantCategory: 'grocery',
    merchantName: 'Metro Cash & Carry',
    location: {
      lat: 33.6844,
      lng: 73.0479,
      city: 'Islamabad',
      country: 'Pakistan'
    },
    deviceInfo: {
      deviceId: 'device_abc123',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0'
    }
  };

  try {
    console.log(`\n🧪 Testing ${fraudulent ? 'FRAUDULENT' : 'NORMAL'} transaction...`);
    console.log('Transaction:', JSON.stringify(transaction, null, 2));

    const response = await axios.post(
      `${API_URL}/api/transactions`,
      transaction,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.fraudScore >= 75) {
      console.log('⚠️  Transaction flagged for verification!');
    } else {
      console.log('✅ Transaction approved automatically');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('Token:', token);

  // Test normal transaction
  await testTransaction(false);

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test fraudulent transaction
  await testTransaction(true);

  console.log('\n✅ Tests complete!');
}

runTests();
