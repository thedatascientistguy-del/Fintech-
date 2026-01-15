# Quick Start Guide

Get your FinTech Fraud Detection SaaS up and running in 10 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Python 3.11+ ([Download](https://www.python.org/))
- Docker & Docker Compose ([Download](https://www.docker.com/))

## Step 1: Clone & Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd fintech-fraud-detection

# Run setup script (Linux/Mac)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or manually:
npm install
cd ml-model && pip install -r requirements.txt && cd ..
```

## Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your credentials:
# - Twilio credentials (get from https://www.twilio.com/console)
# - OpenAI API key (get from https://platform.openai.com/api-keys)
# - Database passwords
# - JWT secret (generate: openssl rand -base64 32)
# - Encryption key (generate: openssl rand -hex 32)
```

## Step 3: Generate Dataset & Train Model

```bash
cd ml-model

# Generate synthetic fraud dataset (50,000 transactions)
python generate_dataset.py

# Train the fraud detection model
python train_model.py

cd ..
```

Expected output:
```
Dataset generated: 50000 samples
Fraud cases: 2500 (5.00%)
Training XGBoost model...
ROC-AUC Score: 0.95+
Model saved to models/fraud_model.pkl
```

## Step 4: Start Services

### Option A: Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option B: Manual Start (Development)

```bash
# Terminal 1: Start databases
docker-compose up -d postgres redis mongodb

# Terminal 2: ML Model Service
cd ml-model && python app.py

# Terminal 3: Transaction API
cd services/transaction-api && npm run dev

# Terminal 4: Fraud Detection
cd services/fraud-detection && npm run dev

# Terminal 5: Verification Service
cd services/verification-service && npm run dev

# Terminal 6: AI Voice Agent
cd services/ai-voice-agent && npm run dev

# Terminal 7: Admin Dashboard
cd services/admin-dashboard && npm run dev
```

## Step 5: Initialize Database

```bash
node scripts/init-db.js
```

## Step 6: Test the System

```bash
# Run API test
node scripts/test-api.js
```

Expected output:
```
🧪 Testing NORMAL transaction...
✅ Transaction approved automatically
Fraud Score: 25

🧪 Testing FRAUDULENT transaction...
⚠️  Transaction flagged for verification!
Fraud Score: 87
```

## Step 7: Access Admin Dashboard

Open your browser and navigate to:
```
http://localhost:3004
```

You should see:
- Total Transactions
- Fraud Detection Rate
- Verification Statistics
- Account Blocks

## API Usage Example

### Generate JWT Token

```javascript
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { 
    tenantId: 'your_bank_id', 
    tenantName: 'Your Bank Name' 
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('Token:', token);
```

### Submit Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_123",
    "amount": 15000,
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
      "deviceId": "device_abc123",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0"
    }
  }'
```

### Response

```json
{
  "transactionId": "uuid-here",
  "status": "approved",
  "fraudScore": 25
}
```

## Service Endpoints

| Service | Port | URL |
|---------|------|-----|
| Transaction API | 3000 | http://localhost:3000 |
| Fraud Detection | 3001 | http://localhost:3001 |
| Verification Service | 3002 | http://localhost:3002 |
| AI Voice Agent | 3003 | http://localhost:3003 |
| Admin Dashboard | 3004 | http://localhost:3004 |
| ML Model Service | 5000 | http://localhost:5000 |

## Health Checks

```bash
# Check all services
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:5000/health
```

## Troubleshooting

### Services won't start

**Check Docker:**
```bash
docker-compose ps
docker-compose logs [service-name]
```

**Check ports:**
```bash
# Linux/Mac
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

### Database connection failed

1. Ensure PostgreSQL is running: `docker-compose ps postgres`
2. Check credentials in `.env`
3. Initialize schema: `node scripts/init-db.js`

### ML Model not found

```bash
cd ml-model
python train_model.py
```

### Twilio calls not working

1. Verify Twilio credentials in `.env`
2. Check phone number format: `+923001234567`
3. Ensure webhook URL is publicly accessible (use ngrok for local testing)

### High fraud scores for normal transactions

The model needs more training data. You can:
1. Generate more data: Edit `n_samples` in `generate_dataset.py`
2. Adjust fraud threshold in `.env`: `FRAUD_THRESHOLD=85`

## Next Steps

1. **Read Documentation:**
   - [API Documentation](docs/API.md)
   - [Architecture](docs/ARCHITECTURE.md)
   - [Security Guidelines](docs/SECURITY.md)
   - [Deployment Guide](docs/DEPLOYMENT.md)

2. **Customize:**
   - Adjust fraud threshold
   - Add custom fraud rules
   - Customize voice agent messages
   - Add more merchant categories

3. **Production Deployment:**
   - Set up SSL/TLS certificates
   - Configure production databases
   - Set up monitoring (Prometheus/Grafana)
   - Enable auto-scaling

4. **Integration:**
   - Generate API keys for partners
   - Set up webhooks
   - Configure rate limits
   - Test with real transactions

## Support

- **Documentation:** See `docs/` folder
- **Issues:** Create an issue on GitHub
- **Email:** support@frauddetection.example.com

## License

Proprietary - All rights reserved

---

**🎉 Congratulations! Your fraud detection system is ready!**
