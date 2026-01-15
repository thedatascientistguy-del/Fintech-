# Project Structure

```
fintech-fraud-detection/
│
├── README.md                          # Project overview
├── QUICKSTART.md                      # Quick start guide
├── PROJECT_STRUCTURE.md               # This file
├── package.json                       # Root package.json
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Docker orchestration
│
├── docs/                              # Documentation
│   ├── API.md                         # API documentation
│   ├── ARCHITECTURE.md                # System architecture
│   ├── DEPLOYMENT.md                  # Deployment guide
│   └── SECURITY.md                    # Security guidelines
│
├── scripts/                           # Utility scripts
│   ├── setup.sh                       # Setup script
│   ├── init-db.js                     # Database initialization
│   └── test-api.js                    # API testing script
│
├── shared/                            # Shared code across services
│   ├── models/                        # Data models
│   │   ├── transaction.js             # Transaction model
│   │   └── customer.js                # Customer model
│   ├── utils/                         # Utilities
│   │   ├── encryption.js              # Encryption utilities
│   │   └── logger.js                  # Logging utilities
│   └── config/                        # Configuration
│       └── database.js                # Database configuration
│
├── services/                          # Microservices
│   │
│   ├── transaction-api/               # Transaction API Gateway
│   │   ├── package.json
│   │   ├── server.js                  # Main server
│   │   ├── Dockerfile
│   │   ├── middleware/
│   │   │   └── auth.js                # JWT authentication
│   │   └── routes/
│   │       └── transactions.js        # Transaction routes
│   │
│   ├── fraud-detection/               # Fraud Detection Service
│   │   ├── package.json
│   │   ├── server.js                  # Main server
│   │   ├── fraudDetector.js           # Fraud detection logic
│   │   └── Dockerfile
│   │
│   ├── verification-service/          # Customer Verification Service
│   │   ├── package.json
│   │   ├── server.js                  # Main server with verification logic
│   │   └── Dockerfile
│   │
│   ├── ai-voice-agent/                # AI Voice Agent Service
│   │   ├── package.json
│   │   ├── server.js                  # Twilio integration
│   │   ├── voiceAgent.js              # Voice agent logic
│   │   └── Dockerfile
│   │
│   └── admin-dashboard/               # Admin Dashboard
│       ├── package.json
│       ├── server.js                  # Dashboard server
│       ├── Dockerfile
│       ├── views/                     # EJS templates
│       │   └── dashboard.ejs          # Dashboard view
│       └── public/                    # Static assets
│
└── ml-model/                          # Machine Learning Service
    ├── requirements.txt               # Python dependencies
    ├── generate_dataset.py            # Dataset generation
    ├── train_model.py                 # Model training
    ├── app.py                         # Flask API server
    ├── Dockerfile
    ├── data/                          # Dataset storage
    │   └── fraud_dataset.csv          # Generated dataset
    └── models/                        # Trained models
        ├── fraud_model.pkl            # XGBoost model
        └── scaler.pkl                 # Feature scaler
```

## Service Breakdown

### 1. Transaction API (Node.js)
- **Port:** 3000
- **Purpose:** Main API gateway for transaction submission
- **Dependencies:** Express, JWT, Axios, PostgreSQL, Redis
- **Key Files:**
  - `server.js` - Express server setup
  - `routes/transactions.js` - Transaction endpoints
  - `middleware/auth.js` - JWT authentication

### 2. Fraud Detection (Node.js)
- **Port:** 3001
- **Purpose:** Analyze transactions for fraud
- **Dependencies:** Express, Redis, Axios
- **Key Files:**
  - `server.js` - Service entry point
  - `fraudDetector.js` - Fraud detection logic with ML integration

### 3. Verification Service (Node.js)
- **Port:** 3002
- **Purpose:** Manage customer verification workflow
- **Dependencies:** Express, Redis, Axios
- **Key Files:**
  - `server.js` - Verification workflow and CNIC validation

### 4. AI Voice Agent (Node.js)
- **Port:** 3003
- **Purpose:** Handle voice calls via Twilio
- **Dependencies:** Express, Twilio, OpenAI, Redis
- **Key Files:**
  - `server.js` - Twilio webhook handlers
  - `voiceAgent.js` - Voice conversation logic (Urdu/English)

### 5. Admin Dashboard (Node.js)
- **Port:** 3004
- **Purpose:** Monitoring and analytics
- **Dependencies:** Express, EJS, MongoDB, PostgreSQL
- **Key Files:**
  - `server.js` - Dashboard server
  - `views/dashboard.ejs` - Dashboard UI

### 6. ML Model Service (Python)
- **Port:** 5000
- **Purpose:** Fraud prediction using XGBoost
- **Dependencies:** Flask, XGBoost, scikit-learn, pandas
- **Key Files:**
  - `app.py` - Flask API server
  - `train_model.py` - Model training script
  - `generate_dataset.py` - Dataset generation

## Data Flow

```
Bank/Wallet App
      ↓
Transaction API (3000)
      ↓
Fraud Detection (3001)
      ↓
ML Model Service (5000)
      ↓
[If fraud_score >= 75%]
      ↓
Verification Service (3002)
      ↓
AI Voice Agent (3003)
      ↓
Twilio → Customer Phone
      ↓
CNIC Verification
      ↓
Transaction Approved/Rejected
```

## Database Schema

### PostgreSQL Tables
- **tenants** - Bank/wallet partners
- **customers** - Customer information (encrypted CNIC)
- **transactions** - Transaction records with fraud scores

### Redis Keys
- `verify:{transactionId}` - Verification sessions
- `history:{customerId}` - Customer transaction history
- `fraud:{transactionId}` - Cached fraud scores

### MongoDB Collections
- **audit_logs** - All system events
- **call_logs** - Voice call records

## Configuration Files

- `.env` - Environment variables (credentials, ports, thresholds)
- `docker-compose.yml` - Container orchestration
- `package.json` - Node.js dependencies
- `requirements.txt` - Python dependencies

## Key Features Implementation

### 1. Fraud Detection (75% Threshold)
- **File:** `services/fraud-detection/fraudDetector.js`
- **ML Model:** `ml-model/train_model.py`
- **Features:** Amount, frequency, location, device, merchant category

### 2. AI Voice Agent (Urdu/English)
- **File:** `services/ai-voice-agent/voiceAgent.js`
- **Integration:** Twilio Programmable Voice
- **Languages:** Urdu (primary), English (fallback)

### 3. CNIC Verification (3 Attempts)
- **File:** `services/verification-service/server.js`
- **Logic:** Track attempts in Redis, block after 3 failures

### 4. Encryption (AES-256-GCM)
- **File:** `shared/utils/encryption.js`
- **Usage:** CNIC, phone numbers, sensitive data

### 5. Multi-tenant Support
- **File:** `services/transaction-api/middleware/auth.js`
- **Method:** JWT tokens with tenantId claim

### 6. Audit Logging
- **File:** `shared/utils/logger.js`
- **Storage:** MongoDB for audit logs
- **Events:** All transactions, verifications, blocks

## Technology Stack

**Backend:**
- Node.js 18+ (JavaScript runtime)
- Express 4.x (Web framework)
- Python 3.11+ (ML service)

**Databases:**
- PostgreSQL 15+ (Transactional data)
- Redis 7+ (Cache & sessions)
- MongoDB 7+ (Audit logs)

**ML/AI:**
- XGBoost (Fraud detection)
- scikit-learn (Preprocessing)
- Twilio (Voice calls)
- OpenAI (AI capabilities)

**DevOps:**
- Docker (Containerization)
- Docker Compose (Orchestration)

## Getting Started

1. **Setup:** Run `./scripts/setup.sh`
2. **Configure:** Edit `.env` with your credentials
3. **Train Model:** `cd ml-model && python train_model.py`
4. **Start Services:** `docker-compose up -d`
5. **Test:** `node scripts/test-api.js`
6. **Monitor:** Open http://localhost:3004

## Documentation

- **Quick Start:** `QUICKSTART.md`
- **API Reference:** `docs/API.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **Security:** `docs/SECURITY.md`
- **Deployment:** `docs/DEPLOYMENT.md`

## Support

For questions or issues, refer to the documentation or contact support.
