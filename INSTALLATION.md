# Installation Guide

Complete step-by-step installation guide for the FinTech Fraud Detection SaaS platform.

## System Requirements

### Minimum Requirements
- **OS:** Linux, macOS, or Windows 10+
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 20 GB free space
- **Network:** Stable internet connection

### Recommended for Production
- **CPU:** 8+ cores
- **RAM:** 16+ GB
- **Storage:** 100+ GB SSD
- **Network:** High-speed connection with static IP

## Prerequisites Installation

### 1. Node.js (v18+)

**Linux/macOS:**
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Windows:**
Download from [nodejs.org](https://nodejs.org/) and install.

**Verify:**
```bash
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

### 2. Python (v3.11+)

**Linux:**
```bash
sudo apt update
sudo apt install python3.11 python3-pip
```

**macOS:**
```bash
brew install python@3.11
```

**Windows:**
Download from [python.org](https://www.python.org/) and install.

**Verify:**
```bash
python3 --version  # Should show 3.11.x
pip3 --version
```

### 3. Docker & Docker Compose

**Linux:**
```bash
# Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**macOS:**
```bash
brew install --cask docker
```

**Windows:**
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

**Verify:**
```bash
docker --version
docker-compose --version
```

### 4. Git

**Linux:**
```bash
sudo apt install git
```

**macOS:**
```bash
brew install git
```

**Windows:**
Download from [git-scm.com](https://git-scm.com/)

## Project Installation

### Step 1: Clone Repository

```bash
git clone <your-repository-url>
cd fintech-fraud-detection
```

### Step 2: Install Dependencies

**Option A: Automated (Recommended)**
```bash
# Linux/macOS
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Option B: Manual**
```bash
# Root dependencies
npm install

# Service dependencies
cd services/transaction-api && npm install && cd ../..
cd services/fraud-detection && npm install && cd ../..
cd services/verification-service && npm install && cd ../..
cd services/ai-voice-agent && npm install && cd ../..
cd services/admin-dashboard && npm install && cd ../..

# Python dependencies
cd ml-model
pip3 install -r requirements.txt
cd ..
```

### Step 3: Environment Configuration

```bash
# Copy template
cp .env.example .env

# Edit configuration
nano .env  # or use your preferred editor
```

**Required Configuration:**

```env
# Database (use defaults for local development)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=fraud_detection
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MongoDB
MONGO_URI=mongodb://localhost:27017/fraud_logs

# Twilio (get from https://www.twilio.com/console)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_key

# JWT Secret (generate: openssl rand -base64 32)
JWT_SECRET=your_jwt_secret_here

# Encryption Key (generate: openssl rand -hex 32)
ENCRYPTION_KEY=your_32_byte_encryption_key

# Fraud Detection
FRAUD_THRESHOLD=75
MAX_VERIFICATION_ATTEMPTS=3

# Environment
NODE_ENV=development
```

**Generate Secrets:**
```bash
# JWT Secret
openssl rand -base64 32

# Encryption Key
openssl rand -hex 32
```

### Step 4: Generate Dataset

```bash
cd ml-model
python3 generate_dataset.py
```

**Expected Output:**
```
Dataset generated: 50000 samples
Fraud cases: 2500 (5.00%)
Amount statistics (PKR):
...
Dataset saved to data/fraud_dataset.csv
```

### Step 5: Train ML Model

```bash
python3 train_model.py
```

**Expected Output:**
```
Loading dataset...
Training XGBoost model...
Evaluating model...

Classification Report:
              precision    recall  f1-score   support
           0       0.99      0.99      0.99      9500
           1       0.85      0.87      0.86       500

ROC-AUC Score: 0.95+

Model saved to models/fraud_model.pkl
Scaler saved to models/scaler.pkl
```

```bash
cd ..
```

### Step 6: Start Infrastructure

```bash
# Start databases
docker-compose up -d postgres redis mongodb

# Wait for databases to be ready (30 seconds)
sleep 30

# Initialize database schema
node scripts/init-db.js
```

**Verify:**
```bash
docker-compose ps

# Should show:
# postgres   Up
# redis      Up
# mongodb    Up
```

### Step 7: Start Services

**Option A: Docker (All Services)**
```bash
docker-compose up -d
```

**Option B: Manual (Development)**

Open 7 terminal windows:

**Terminal 1: ML Model Service**
```bash
cd ml-model
python3 app.py
```

**Terminal 2: Transaction API**
```bash
cd services/transaction-api
npm run dev
```

**Terminal 3: Fraud Detection**
```bash
cd services/fraud-detection
npm run dev
```

**Terminal 4: Verification Service**
```bash
cd services/verification-service
npm run dev
```

**Terminal 5: AI Voice Agent**
```bash
cd services/ai-voice-agent
npm run dev
```

**Terminal 6: Admin Dashboard**
```bash
cd services/admin-dashboard
npm run dev
```

**Terminal 7: (Optional) Logs**
```bash
tail -f logs/combined.log
```

### Step 8: Verify Installation

**Check Service Health:**
```bash
curl http://localhost:3000/health  # Transaction API
curl http://localhost:3001/health  # Fraud Detection
curl http://localhost:3002/health  # Verification Service
curl http://localhost:3003/health  # AI Voice Agent
curl http://localhost:3004/health  # Admin Dashboard
curl http://localhost:5000/health  # ML Model Service
```

**Expected Response (each):**
```json
{
  "status": "healthy",
  "service": "service-name"
}
```

### Step 9: Run Tests

```bash
node scripts/test-api.js
```

**Expected Output:**
```
🚀 Starting API Tests...
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🧪 Testing NORMAL transaction...
✅ Response: {
  "transactionId": "uuid-here",
  "status": "approved",
  "fraudScore": 25
}
✅ Transaction approved automatically

🧪 Testing FRAUDULENT transaction...
✅ Response: {
  "transactionId": "uuid-here",
  "status": "pending_verification",
  "fraudScore": 87
}
⚠️  Transaction flagged for verification!

✅ Tests complete!
```

### Step 10: Access Dashboard

Open browser: **http://localhost:3004**

You should see:
- Total Transactions: 0
- Fraud Detection Rate: 0%
- Verifications Initiated: 0
- Accounts Blocked: 0

## Troubleshooting

### Port Already in Use

**Find process:**
```bash
# Linux/macOS
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

**Kill process:**
```bash
# Linux/macOS
kill -9 <PID>

# Windows
taskkill /PID <PID> /F
```

**Or change port in .env:**
```env
TRANSACTION_API_PORT=3100
```

### Database Connection Failed

**Check if running:**
```bash
docker-compose ps postgres
```

**Restart:**
```bash
docker-compose restart postgres
```

**Check logs:**
```bash
docker-compose logs postgres
```

### ML Model Not Found

```bash
cd ml-model
python3 train_model.py
cd ..
```

### Permission Denied (Linux/macOS)

```bash
chmod +x scripts/setup.sh
sudo chown -R $USER:$USER .
```

### Docker Issues

**Restart Docker:**
```bash
# Linux
sudo systemctl restart docker

# macOS/Windows
# Restart Docker Desktop
```

**Clean up:**
```bash
docker-compose down -v
docker system prune -a
```

### Python Module Not Found

```bash
cd ml-model
pip3 install -r requirements.txt --upgrade
```

### Node Module Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

## Verification Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.11+ installed
- [ ] Docker & Docker Compose installed
- [ ] All dependencies installed
- [ ] .env file configured
- [ ] Dataset generated (50,000 samples)
- [ ] ML model trained (ROC-AUC > 0.90)
- [ ] Databases running (PostgreSQL, Redis, MongoDB)
- [ ] Database schema initialized
- [ ] All 6 services running
- [ ] Health checks passing
- [ ] Test API successful
- [ ] Dashboard accessible

## Next Steps

1. **Read Documentation:**
   - [Quick Start Guide](QUICKSTART.md)
   - [API Documentation](docs/API.md)
   - [Architecture Overview](docs/ARCHITECTURE.md)

2. **Configure Twilio:**
   - Sign up at [twilio.com](https://www.twilio.com/)
   - Get Account SID and Auth Token
   - Purchase a phone number
   - Update .env file

3. **Configure OpenAI:**
   - Sign up at [platform.openai.com](https://platform.openai.com/)
   - Generate API key
   - Update .env file

4. **Test Voice Calls:**
   - Ensure Twilio is configured
   - Use ngrok for local webhook testing
   - Test with real phone number

5. **Production Deployment:**
   - See [Deployment Guide](docs/DEPLOYMENT.md)
   - Set up SSL/TLS
   - Configure monitoring
   - Enable auto-scaling

## Support

- **Documentation:** See `docs/` folder
- **Issues:** Create GitHub issue
- **Email:** support@frauddetection.example.com

## Uninstallation

```bash
# Stop all services
docker-compose down -v

# Remove project
cd ..
rm -rf fintech-fraud-detection

# Remove Docker images (optional)
docker rmi $(docker images -q fintech-fraud-detection*)
```

---

**Installation complete! 🎉**
