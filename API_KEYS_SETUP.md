# 🔑 API Keys Setup Guide

This guide shows you **exactly where** to add your API keys and credentials.

---

## 📍 Main Configuration File: `.env`

**Location:** Root directory of the project

### Step 1: Create .env file

```bash
cp .env.example .env
```

### Step 2: Edit .env file

Open `.env` in your text editor and add the following credentials:

---

## 🔐 Required API Keys

### 1. Twilio Credentials (REQUIRED for Voice Calls)

**Where to get:**
1. Go to https://www.twilio.com/console
2. Sign up for a free account
3. Copy your credentials from the dashboard

**Add to `.env`:**
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Used in:**
- `services/ai-voice-agent/server.js` (Line 11-13)
- `services/ai-voice-agent/voiceAgent.js` (Line 3)

**Example:**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567
```

---

### 2. OpenAI API Key (OPTIONAL - for enhanced AI)

**Where to get:**
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with sk-)

**Add to `.env`:**
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Used in:**
- `services/ai-voice-agent/voiceAgent.js` (Line 5)

**Example:**
```env
OPENAI_API_KEY=sk-proj-1234567890abcdefghijklmnopqrstuvwxyz
```

**Note:** OpenAI is optional. The voice agent works with Twilio's built-in speech recognition.

---

### 3. JWT Secret (REQUIRED - Generate Yourself)

**How to generate:**

**Option A: Using OpenSSL (Linux/Mac/Git Bash)**
```bash
openssl rand -base64 32
```

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C: Using PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Add to `.env`:**
```env
# JWT Secret (for API authentication)
JWT_SECRET=your_generated_secret_here
JWT_EXPIRY=24h
```

**Used in:**
- `services/transaction-api/middleware/auth.js` (Line 8)
- `scripts/test-api.js` (Line 5)

**Example:**
```env
JWT_SECRET=xK8vN2pQ9mL5wR7tY3uI6oP1aS4dF8gH2jK5lZ9xC3vB6nM0qW4eR7tY1uI3oP
JWT_EXPIRY=24h
```

---

### 4. Encryption Key (REQUIRED - Generate Yourself)

**How to generate:**

**Option A: Using OpenSSL (Linux/Mac/Git Bash)**
```bash
openssl rand -hex 32
```

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option C: Using PowerShell (Windows)**
```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) })
```

**Add to `.env`:**
```env
# Encryption Key (32 bytes for AES-256)
ENCRYPTION_KEY=your_64_character_hex_string_here
```

**Used in:**
- `shared/utils/encryption.js` (Line 5)

**Example:**
```env
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**IMPORTANT:** Must be exactly 64 hexadecimal characters (32 bytes)

---

### 5. Database Credentials (Use defaults for local development)

**For Local Development (Docker):**
```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=fraud_detection
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MongoDB
MONGO_URI=mongodb://localhost:27017/fraud_logs
```

**For Production:**
Replace with your actual database credentials.

**Used in:**
- `shared/config/database.js` (Lines 3-8)
- `services/fraud-detection/fraudDetector.js` (Line 7)
- `shared/utils/logger.js` (Line 20)

---

### 6. Other Configuration (Optional)

```env
# Fraud Detection Settings
FRAUD_THRESHOLD=75
MAX_VERIFICATION_ATTEMPTS=3

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Service Ports (change if needed)
TRANSACTION_API_PORT=3000
FRAUD_DETECTION_PORT=3001
VERIFICATION_SERVICE_PORT=3002
AI_VOICE_AGENT_PORT=3003
ADMIN_DASHBOARD_PORT=3004

# Environment
NODE_ENV=development
```

---

## 📝 Complete .env Example

Here's a complete example with all required fields:

```env
# Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=fraud_detection
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

MONGO_URI=mongodb://localhost:27017/fraud_logs

# Twilio Configuration (GET FROM: https://www.twilio.com/console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567

# OpenAI Configuration (GET FROM: https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-1234567890abcdefghijklmnopqrstuvwxyz

# JWT Secret (GENERATE: openssl rand -base64 32)
JWT_SECRET=xK8vN2pQ9mL5wR7tY3uI6oP1aS4dF8gH2jK5lZ9xC3vB6nM0qW4eR7tY1uI3oP
JWT_EXPIRY=24h

# Encryption Key (GENERATE: openssl rand -hex 32)
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Fraud Detection Settings
FRAUD_THRESHOLD=75
MAX_VERIFICATION_ATTEMPTS=3

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# Service Ports
TRANSACTION_API_PORT=3000
FRAUD_DETECTION_PORT=3001
VERIFICATION_SERVICE_PORT=3002
AI_VOICE_AGENT_PORT=3003
ADMIN_DASHBOARD_PORT=3004

# Environment
NODE_ENV=development
```

---

## 🔍 Where Each Key is Used in Code

### Twilio Keys

**File:** `services/ai-voice-agent/server.js`
```javascript
// Line 11-13
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,      // ← Your Twilio Account SID
  process.env.TWILIO_AUTH_TOKEN        // ← Your Twilio Auth Token
);

// Line 25
from: process.env.TWILIO_PHONE_NUMBER  // ← Your Twilio Phone Number
```

### OpenAI Key

**File:** `services/ai-voice-agent/voiceAgent.js`
```javascript
// Line 5
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY   // ← Your OpenAI API Key
});
```

### JWT Secret

**File:** `services/transaction-api/middleware/auth.js`
```javascript
// Line 8
const decoded = jwt.verify(token, process.env.JWT_SECRET);  // ← Your JWT Secret
```

**File:** `scripts/test-api.js`
```javascript
// Line 5
const token = jwt.sign(
  { tenantId: 'test_bank_1', tenantName: 'Test Bank' },
  process.env.JWT_SECRET || 'test_secret',  // ← Your JWT Secret
  { expiresIn: '24h' }
);
```

### Encryption Key

**File:** `shared/utils/encryption.js`
```javascript
// Line 5
const KEY = Buffer.from(
  process.env.ENCRYPTION_KEY ||           // ← Your Encryption Key
  crypto.randomBytes(32).toString('hex').slice(0, 32)
);
```

### Database Credentials

**File:** `shared/config/database.js`
```javascript
// Lines 3-8
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'fraud_detection',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  // ...
});
```

---

## ✅ Quick Setup Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Sign up for Twilio account
- [ ] Add Twilio Account SID to `.env`
- [ ] Add Twilio Auth Token to `.env`
- [ ] Add Twilio Phone Number to `.env`
- [ ] (Optional) Sign up for OpenAI
- [ ] (Optional) Add OpenAI API Key to `.env`
- [ ] Generate JWT Secret (32 bytes)
- [ ] Add JWT Secret to `.env`
- [ ] Generate Encryption Key (32 bytes hex)
- [ ] Add Encryption Key to `.env`
- [ ] Keep database defaults for local development
- [ ] Save `.env` file
- [ ] Never commit `.env` to git (already in .gitignore)

---

## 🚀 After Adding Keys

Once you've added all keys to `.env`:

```bash
# 1. Install dependencies
npm install

# 2. Generate dataset and train model
cd ml-model
python generate_dataset.py
python train_model.py
cd ..

# 3. Start services
docker-compose up -d

# 4. Initialize database
node scripts/init-db.js

# 5. Test the system
node scripts/test-api.js
```

---

## 🔒 Security Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Use different keys for production** - Generate new keys for production
3. **Rotate keys regularly** - Change keys every 90 days
4. **Use environment-specific keys** - Different keys for dev/staging/production
5. **Store production keys securely** - Use AWS Secrets Manager, HashiCorp Vault, etc.

---

## 🆘 Troubleshooting

### "TWILIO_ACCOUNT_SID is not defined"
- Make sure `.env` file exists in root directory
- Check that you've added `TWILIO_ACCOUNT_SID=...` in `.env`
- Restart services after editing `.env`

### "Invalid JWT token"
- Make sure `JWT_SECRET` is set in `.env`
- Generate a new secret using `openssl rand -base64 32`
- Restart services after changing JWT_SECRET

### "Encryption key must be 32 bytes"
- Generate key using `openssl rand -hex 32`
- Make sure it's exactly 64 hexadecimal characters
- No spaces or line breaks in the key

---

## 📞 Need Help?

If you're stuck:
1. Check the `.env.example` file for reference
2. See `INSTALLATION.md` for detailed setup
3. See `QUICKSTART.md` for quick start guide
4. Check service logs: `docker-compose logs [service-name]`

---

**Ready to go! 🚀**
