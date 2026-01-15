# Testing Guide

Comprehensive testing guide for the FinTech Fraud Detection SaaS platform.

## Testing Overview

This guide covers:
1. Unit testing
2. Integration testing
3. API testing
4. ML model testing
5. Load testing
6. Security testing

## Prerequisites

```bash
npm install --save-dev jest supertest
cd ml-model && pip install pytest
```

## 1. Health Check Tests

Test all services are running:

```bash
# Test all health endpoints
curl http://localhost:3000/health  # Transaction API
curl http://localhost:3001/health  # Fraud Detection
curl http://localhost:3002/health  # Verification Service
curl http://localhost:3003/health  # AI Voice Agent
curl http://localhost:3004/health  # Admin Dashboard
curl http://localhost:5000/health  # ML Model Service
```

Expected response for each:
```json
{
  "status": "healthy",
  "service": "service-name"
}
```

## 2. API Testing

### Automated API Tests

Run the provided test script:

```bash
node scripts/test-api.js
```

### Manual API Tests

#### Test 1: Normal Transaction (Should be approved)

```bash
# Generate JWT token first
TOKEN=$(node -e "console.log(require('jsonwebtoken').sign({tenantId:'test_bank',tenantName:'Test Bank'},process.env.JWT_SECRET||'test_secret',{expiresIn:'24h'}))")

# Submit normal transaction
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_normal_001",
    "amount": 5000,
    "currency": "PKR",
    "merchantCategory": "grocery",
    "merchantName": "Metro Cash & Carry",
    "location": {
      "lat": 33.6844,
      "lng": 73.0479,
      "city": "Islamabad",
      "country": "Pakistan"
    },
    "deviceInfo": {
      "deviceId": "device_123",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0"
    }
  }'
```

Expected response:
```json
{
  "transactionId": "uuid",
  "status": "approved",
  "fraudScore": 20-40
}
```

#### Test 2: Fraudulent Transaction (Should trigger verification)

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_fraud_001",
    "amount": 250000,
    "currency": "PKR",
    "merchantCategory": "gambling",
    "merchantName": "Online Casino",
    "location": {
      "lat": 33.6844,
      "lng": 73.0479,
      "city": "Islamabad",
      "country": "Pakistan"
    },
    "deviceInfo": {
      "deviceId": "new_device_999",
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0"
    }
  }'
```

Expected response:
```json
{
  "transactionId": "uuid",
  "status": "pending_verification",
  "fraudScore": 75-95
}
```

#### Test 3: Rate Limiting

```bash
# Send 101 requests rapidly (should hit rate limit)
for i in {1..101}; do
  curl -X POST http://localhost:3000/api/transactions \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"customerId":"test","amount":1000,"currency":"PKR","merchantCategory":"test","merchantName":"test","location":{},"deviceInfo":{}}' &
done
wait
```

Expected: 429 Too Many Requests after 100 requests

## 3. ML Model Testing

### Test Model Prediction

```bash
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "amount": 250000,
      "amount_deviation": 5.0,
      "transaction_count_24h": 10,
      "merchant_category": 8,
      "hour_of_day": 2,
      "day_of_week": 6,
      "is_weekend": 1,
      "device_change": 1,
      "location_change": 1
    }
  }'
```

Expected response:
```json
{
  "fraud_probability": 0.85,
  "is_fraud": 1,
  "confidence": 0.85
}
```

### Test Model Accuracy

```bash
cd ml-model
python3 -c "
import joblib
import pandas as pd
from sklearn.metrics import classification_report

# Load model and test data
model = joblib.load('models/fraud_model.pkl')
scaler = joblib.load('models/scaler.pkl')
df = pd.read_csv('data/fraud_dataset.csv')

# Test on last 1000 samples
test_data = df.tail(1000)
X_test = test_data[['amount', 'amount_deviation', 'transaction_count_24h', 
                     'merchant_category_encoded', 'hour_of_day', 'day_of_week',
                     'is_weekend', 'device_change', 'location_change']]
y_test = test_data['is_fraud']

X_test_scaled = scaler.transform(X_test)
y_pred = model.predict(X_test_scaled)

print(classification_report(y_test, y_pred))
"
```

## 4. Verification Service Testing

### Test CNIC Verification

```bash
# Initiate verification
curl -X POST http://localhost:3002/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test_tx_001"
  }'

# Test correct CNIC (should succeed)
curl -X POST http://localhost:3002/api/verify/cnic \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test_tx_001",
    "cnicInput": "45"
  }'

# Test incorrect CNIC (should fail)
curl -X POST http://localhost:3002/api/verify/cnic \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test_tx_001",
    "cnicInput": "99"
  }'
```

### Test 3-Attempt Limit

```bash
# Make 3 incorrect attempts
for i in {1..3}; do
  curl -X POST http://localhost:3002/api/verify/cnic \
    -H "Content-Type: application/json" \
    -d '{
      "transactionId": "test_tx_002",
      "cnicInput": "99"
    }'
done

# 4th attempt should result in account block
```

## 5. Voice Agent Testing

### Test Call Initiation

```bash
curl -X POST http://localhost:3003/api/call \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "test_tx_003",
    "phone": "+923001234567",
    "language": "urdu"
  }'
```

Expected response:
```json
{
  "callSid": "CA...",
  "status": "initiated"
}
```

### Test TwiML Generation

```bash
curl "http://localhost:3003/api/voice/twiml?transactionId=test_tx_003&language=urdu"
```

Expected: TwiML XML response with Urdu greeting

## 6. Database Testing

### Test PostgreSQL Connection

```bash
docker exec -it fintech-fraud-detection_postgres_1 psql -U postgres -d fraud_detection -c "SELECT COUNT(*) FROM transactions;"
```

### Test Redis Connection

```bash
docker exec -it fintech-fraud-detection_redis_1 redis-cli PING
```

Expected: PONG

### Test MongoDB Connection

```bash
docker exec -it fintech-fraud-detection_mongodb_1 mongosh --eval "db.adminCommand('ping')"
```

## 7. Load Testing

### Using Apache Bench

```bash
# Install Apache Bench
sudo apt install apache2-utils  # Linux
brew install httpd              # macOS

# Test Transaction API (100 requests, 10 concurrent)
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
   -p transaction.json -T application/json \
   http://localhost:3000/api/transactions
```

### Using Artillery

```bash
npm install -g artillery

# Create test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
  headers:
    Authorization: 'Bearer YOUR_TOKEN'
scenarios:
  - flow:
    - post:
        url: '/api/transactions'
        json:
          customerId: 'load_test_{{ \$randomNumber() }}'
          amount: 5000
          currency: 'PKR'
          merchantCategory: 'grocery'
          merchantName: 'Test Store'
          location: {}
          deviceInfo: {}
EOF

# Run load test
artillery run load-test.yml
```

Expected metrics:
- Response time: < 200ms (p95)
- Success rate: > 99%
- Errors: < 1%

## 8. Security Testing

### Test JWT Authentication

```bash
# Without token (should fail)
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 401 Unauthorized

# With invalid token (should fail)
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 401 Unauthorized
```

### Test Encryption

```bash
node -e "
const Encryption = require('./shared/utils/encryption');

// Test encryption
const data = '12';
const encrypted = Encryption.encrypt(data);
console.log('Encrypted:', encrypted);

const decrypted = Encryption.decrypt(encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', data === decrypted);

// Test masking
console.log('CNIC Masked:', Encryption.maskCNIC('1234567890123'));
console.log('Phone Masked:', Encryption.maskPhone('+923001234567'));
"
```

### Test SQL Injection Protection

```bash
# Attempt SQL injection
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test OR 1=1",
    "amount": 5000,
    "currency": "PKR",
    "merchantCategory": "test",
    "merchantName": "test",
    "location": {},
    "deviceInfo": {}
  }'

# Should be handled safely by parameterized queries
```

## 9. Integration Testing

### End-to-End Fraud Detection Flow

```bash
# 1. Submit fraudulent transaction
RESPONSE=$(curl -s -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "e2e_test_001",
    "amount": 300000,
    "currency": "PKR",
    "merchantCategory": "gambling",
    "merchantName": "Casino",
    "location": {"lat": 33.6844, "lng": 73.0479, "city": "Islamabad", "country": "Pakistan"},
    "deviceInfo": {"deviceId": "new_device", "ip": "192.168.1.1", "userAgent": "Mozilla/5.0"}
  }')

echo "Transaction Response: $RESPONSE"

# 2. Extract transaction ID
TX_ID=$(echo $RESPONSE | jq -r '.transactionId')

# 3. Wait for verification to be initiated
sleep 2

# 4. Check verification was triggered
# (In real scenario, voice call would be made)

# 5. Verify with correct CNIC
curl -X POST http://localhost:3002/api/verify/cnic \
  -H "Content-Type: application/json" \
  -d "{
    \"transactionId\": \"$TX_ID\",
    \"cnicInput\": \"45\"
  }"

# 6. Check audit logs
curl http://localhost:3004/api/stats
```

## 10. Monitoring Tests

### Check Logs

```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/error.log

# Docker logs
docker-compose logs -f transaction-api
docker-compose logs -f fraud-detection
```

### Check Metrics

```bash
# Database connections
docker exec fintech-fraud-detection_postgres_1 psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Redis memory usage
docker exec fintech-fraud-detection_redis_1 redis-cli INFO memory

# MongoDB stats
docker exec fintech-fraud-detection_mongodb_1 mongosh --eval "db.stats()"
```

## Test Checklist

- [ ] All services health checks pass
- [ ] Normal transactions approved automatically
- [ ] Fraudulent transactions trigger verification
- [ ] ML model predictions accurate (>90%)
- [ ] CNIC verification works correctly
- [ ] 3-attempt limit enforced
- [ ] Account blocking works
- [ ] Voice agent TwiML generated correctly
- [ ] Rate limiting enforced
- [ ] JWT authentication works
- [ ] Encryption/decryption works
- [ ] SQL injection protected
- [ ] Load test passes (>99% success)
- [ ] Audit logs created
- [ ] Dashboard displays data
- [ ] Database connections stable
- [ ] Redis caching works
- [ ] MongoDB logging works

## Continuous Testing

### Set up automated tests

```bash
# Add to package.json
{
  "scripts": {
    "test": "jest",
    "test:api": "node scripts/test-api.js",
    "test:load": "artillery run load-test.yml",
    "test:all": "npm run test && npm run test:api"
  }
}

# Run all tests
npm run test:all
```

## Troubleshooting Tests

### Tests Failing

1. **Check services are running:**
   ```bash
   docker-compose ps
   ```

2. **Check logs for errors:**
   ```bash
   docker-compose logs
   ```

3. **Verify environment variables:**
   ```bash
   cat .env
   ```

4. **Reset databases:**
   ```bash
   docker-compose down -v
   docker-compose up -d
   node scripts/init-db.js
   ```

### Performance Issues

1. **Check resource usage:**
   ```bash
   docker stats
   ```

2. **Optimize database:**
   ```bash
   docker exec fintech-fraud-detection_postgres_1 psql -U postgres -d fraud_detection -c "VACUUM ANALYZE;"
   ```

3. **Clear Redis cache:**
   ```bash
   docker exec fintech-fraud-detection_redis_1 redis-cli FLUSHALL
   ```

## Reporting Issues

When reporting test failures, include:
1. Test command used
2. Expected vs actual result
3. Error messages
4. Service logs
5. Environment details

---

**Happy Testing! 🧪**
