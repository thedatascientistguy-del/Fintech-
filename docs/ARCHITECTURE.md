# System Architecture

## Overview

The FinTech Fraud Detection SaaS is built using a microservices architecture to ensure scalability, maintainability, and high availability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
│                         (nginx/HAProxy)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌───────▼────────┐
        │  Transaction   │       │     Admin      │
        │      API       │       │   Dashboard    │
        │   (Port 3000)  │       │  (Port 3004)   │
        └───────┬────────┘       └───────┬────────┘
                │                        │
        ┌───────▼────────┐               │
        │     Fraud      │               │
        │   Detection    │               │
        │  (Port 3001)   │               │
        └───────┬────────┘               │
                │                        │
        ┌───────▼────────┐               │
        │  Verification  │               │
        │    Service     │               │
        │  (Port 3002)   │               │
        └───────┬────────┘               │
                │                        │
        ┌───────▼────────┐               │
        │   AI Voice     │               │
        │     Agent      │               │
        │  (Port 3003)   │               │
        └───────┬────────┘               │
                │                        │
        ┌───────▼────────┐               │
        │   ML Model     │               │
        │    Service     │               │
        │  (Port 5000)   │               │
        └────────────────┘               │
                                         │
┌────────────────────────────────────────┴──────────────────┐
│                     Data Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │PostgreSQL│  │  Redis   │  │ MongoDB  │                │
│  │(Transact)│  │ (Cache)  │  │  (Logs)  │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└───────────────────────────────────────────────────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        │      External Services          │
                        │  ┌──────────┐  ┌──────────┐    │
                        │  │  Twilio  │  │  OpenAI  │    │
                        │  └──────────┘  └──────────┘    │
                        └─────────────────────────────────┘
```

## Components

### 1. Transaction API (Port 3000)
**Responsibility:** Main API gateway for transaction submission

**Technology:** Node.js, Express

**Key Features:**
- JWT authentication
- Rate limiting
- Request validation
- Transaction routing

**Endpoints:**
- `POST /api/transactions` - Submit transaction
- `GET /api/transactions/:id` - Get transaction status

### 2. Fraud Detection Service (Port 3001)
**Responsibility:** Analyze transactions for fraud

**Technology:** Node.js, Express

**Key Features:**
- ML model integration
- Rule-based fallback
- Feature extraction
- Redis caching

**Process:**
1. Receive transaction data
2. Extract features (amount, frequency, location, etc.)
3. Call ML model service
4. Return fraud probability (0-100)

### 3. Verification Service (Port 3002)
**Responsibility:** Manage customer verification workflow

**Technology:** Node.js, Express

**Key Features:**
- Session management (Redis)
- CNIC verification
- Attempt tracking
- Account blocking

**Workflow:**
1. Receive verification request
2. Create verification session
3. Trigger AI voice call
4. Process CNIC input
5. Update transaction status

### 4. AI Voice Agent (Port 3003)
**Responsibility:** Handle voice calls for verification

**Technology:** Node.js, Express, Twilio, OpenAI

**Key Features:**
- Bilingual support (Urdu/English)
- Speech recognition
- Natural conversation
- Concurrent call handling

**Call Flow:**
1. Receive call request
2. Initiate Twilio call
3. Generate TwiML response
4. Process speech input
5. Verify CNIC
6. Update verification status

### 5. ML Model Service (Port 5000)
**Responsibility:** Fraud prediction using machine learning

**Technology:** Python, Flask, XGBoost, scikit-learn

**Key Features:**
- XGBoost classifier
- Feature scaling
- Model versioning
- Incremental learning support

**Input Features:**
- amount
- amount_deviation
- transaction_count_24h
- merchant_category
- hour_of_day
- day_of_week
- is_weekend
- device_change
- location_change

**Output:**
- fraud_probability (0-1)
- is_fraud (boolean)
- confidence score

### 6. Admin Dashboard (Port 3004)
**Responsibility:** Monitoring and analytics

**Technology:** Node.js, Express, EJS

**Key Features:**
- Real-time statistics
- Transaction logs
- Verification logs
- Fraud analytics

**Pages:**
- Dashboard - Overview statistics
- Transactions - Transaction history
- Verifications - Verification logs

## Data Layer

### PostgreSQL
**Purpose:** Primary transactional database

**Tables:**
- `tenants` - Bank/wallet partners
- `customers` - Customer information (encrypted)
- `transactions` - Transaction records

### Redis
**Purpose:** Caching and session management

**Usage:**
- Verification sessions (TTL: 30 min)
- Customer history cache
- Fraud score cache
- Rate limiting counters

### MongoDB
**Purpose:** Audit logs and analytics

**Collections:**
- `audit_logs` - All system events
- `call_logs` - Voice call records

## External Services

### Twilio
**Purpose:** Voice call infrastructure

**Features:**
- Programmable Voice API
- TwiML for call flow
- Speech recognition
- Call status webhooks

### OpenAI
**Purpose:** AI-powered conversation (optional enhancement)

**Usage:**
- Natural language processing
- Speech synthesis
- Conversation intelligence

## Data Flow

### Normal Transaction Flow
```
1. Bank/Wallet → Transaction API
2. Transaction API → Fraud Detection
3. Fraud Detection → ML Model
4. ML Model → Fraud Score (< 75%)
5. Transaction API → Bank/Wallet (Approved)
```

### Fraudulent Transaction Flow
```
1. Bank/Wallet → Transaction API
2. Transaction API → Fraud Detection
3. Fraud Detection → ML Model
4. ML Model → Fraud Score (≥ 75%)
5. Transaction API → Verification Service
6. Verification Service → AI Voice Agent
7. AI Voice Agent → Twilio → Customer
8. Customer → CNIC Input → Verification Service
9. Verification Service → Transaction API
10. Transaction API → Bank/Wallet (Approved/Rejected)
```

## Scalability Strategy

### Horizontal Scaling
- All services are stateless (except sessions in Redis)
- Can run multiple instances behind load balancer
- Auto-scaling based on CPU/memory metrics

### Database Scaling
- PostgreSQL: Read replicas for queries
- Redis: Cluster mode for high availability
- MongoDB: Sharding for large log volumes

### Caching Strategy
- L1: In-memory cache (service level)
- L2: Redis cache (shared)
- TTL: 1 hour for fraud scores, 30 min for sessions

### Message Queue (Future Enhancement)
- Add RabbitMQ/Kafka for async processing
- Queue verification calls
- Process webhooks asynchronously
- Decouple services further

## Security Architecture

### Network Security
- All services in private network
- Only API gateway exposed publicly
- TLS termination at load balancer

### Data Security
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Sensitive data masked in logs

### Authentication
- JWT tokens for API access
- API keys for tenant identification
- Rate limiting per tenant

## Monitoring & Observability

### Metrics
- Request rate, latency, error rate
- Fraud detection accuracy
- Verification success rate
- System resource usage

### Logging
- Structured JSON logs
- Centralized log aggregation
- Log levels: error, warn, info, debug

### Alerting
- High fraud rate
- Service downtime
- Database connection issues
- API rate limit violations

## Disaster Recovery

### Backup Strategy
- Database: Daily full + hourly incremental
- Models: Version controlled
- Configs: Git repository

### Failover
- Multi-region deployment
- Database replication
- Automatic failover for critical services

### RTO/RPO
- Recovery Time Objective: 4 hours
- Recovery Point Objective: 1 hour

## Technology Stack Summary

**Backend:**
- Node.js 18+ (JavaScript runtime)
- Express 4.x (Web framework)
- Python 3.11+ (ML service)
- Flask 3.x (Python web framework)

**Databases:**
- PostgreSQL 15+ (Relational)
- Redis 7+ (Cache)
- MongoDB 7+ (Logs)

**ML/AI:**
- XGBoost (Fraud detection)
- scikit-learn (Preprocessing)
- OpenAI API (Voice intelligence)

**External Services:**
- Twilio (Voice calls)
- OpenAI (AI capabilities)

**DevOps:**
- Docker (Containerization)
- Docker Compose (Orchestration)
- Kubernetes (Production orchestration)

## Future Enhancements

1. **Real-time Dashboard:** WebSocket-based live updates
2. **SMS Alerts:** Twilio SMS for fraud notifications
3. **Email Notifications:** SendGrid integration
4. **Advanced Analytics:** ML-based trend analysis
5. **Self-learning Model:** Continuous model retraining
6. **Multi-language Support:** Add more languages
7. **Mobile SDK:** Native iOS/Android SDKs
8. **GraphQL API:** Alternative to REST
9. **Blockchain Audit:** Immutable audit trail
10. **Biometric Verification:** Face/fingerprint verification
