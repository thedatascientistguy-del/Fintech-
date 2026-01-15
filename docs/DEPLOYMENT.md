# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- MongoDB 7+

## Environment Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Update `.env` with your credentials:
   - Database credentials
   - Twilio credentials
   - OpenAI API key
   - JWT secret
   - Encryption key

## Local Development

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Generate Dataset & Train Model

```bash
cd ml-model
python generate_dataset.py
python train_model.py
```

### 3. Start Services with Docker

```bash
docker-compose up -d
```

### 4. Start Services Manually (Development)

```bash
# Terminal 1: Transaction API
cd services/transaction-api && npm run dev

# Terminal 2: Fraud Detection
cd services/fraud-detection && npm run dev

# Terminal 3: Verification Service
cd services/verification-service && npm run dev

# Terminal 4: AI Voice Agent
cd services/ai-voice-agent && npm run dev

# Terminal 5: Admin Dashboard
cd services/admin-dashboard && npm run dev

# Terminal 6: ML Model Service
cd ml-model && python app.py
```

## Production Deployment

### Using Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

1. Build and push images:
```bash
docker build -t your-registry/transaction-api:latest ./services/transaction-api
docker push your-registry/transaction-api:latest
# Repeat for all services
```

2. Apply Kubernetes manifests:
```bash
kubectl apply -f k8s/
```

## Scaling Considerations

### High Concurrency (1000+ calls)

1. **Horizontal Scaling:**
   - Run multiple instances of each service
   - Use load balancer (nginx/HAProxy)
   - Configure Redis cluster for session management

2. **Database Optimization:**
   - Use connection pooling
   - Implement read replicas
   - Add database indexes on frequently queried fields

3. **Caching Strategy:**
   - Cache customer data in Redis
   - Cache fraud model predictions (TTL: 1 hour)
   - Use CDN for static assets

4. **Message Queue:**
   - Add RabbitMQ/Kafka for async processing
   - Queue verification calls
   - Process webhooks asynchronously

### Recommended Infrastructure

**Minimum (Development):**
- 2 vCPU, 4GB RAM per service
- 1 PostgreSQL instance (4GB RAM)
- 1 Redis instance (2GB RAM)

**Production (1000 concurrent calls):**
- 4-8 instances per service (4 vCPU, 8GB RAM each)
- PostgreSQL cluster (16GB RAM, SSD storage)
- Redis cluster (8GB RAM)
- Load balancer with SSL termination
- Auto-scaling enabled

## Monitoring

### Health Checks

All services expose `/health` endpoint:
```bash
curl http://localhost:3000/health
```

### Logs

View logs:
```bash
docker-compose logs -f [service-name]
```

### Metrics

- Use Prometheus for metrics collection
- Grafana for visualization
- Alert on:
  - High fraud detection rate
  - Failed verification attempts
  - Service downtime
  - High latency

## Security Checklist

- [ ] Enable HTTPS/TLS for all services
- [ ] Rotate encryption keys regularly
- [ ] Enable database encryption at rest
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up DDoS protection
- [ ] Regular security audits
- [ ] Implement API key rotation
- [ ] Enable audit logging
- [ ] Configure backup strategy

## Backup Strategy

1. **Database Backups:**
   - Daily full backups
   - Hourly incremental backups
   - Retention: 30 days

2. **Model Backups:**
   - Version control for trained models
   - Store in S3/cloud storage

3. **Configuration Backups:**
   - Version control for configs
   - Encrypted secrets storage

## Troubleshooting

### Service Won't Start

Check logs:
```bash
docker-compose logs [service-name]
```

Common issues:
- Database connection failed → Check credentials
- Port already in use → Change port in .env
- Model not found → Train model first

### High Latency

- Check database query performance
- Monitor Redis connection pool
- Review ML model inference time
- Check network latency to Twilio

### Failed Verifications

- Check Twilio credentials
- Verify phone number format
- Check OpenAI API quota
- Review voice agent logs

## Support

For deployment support: devops@frauddetection.example.com
