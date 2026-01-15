# API Documentation

## Authentication

All API requests require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To obtain a token, contact the platform administrator with your bank/wallet credentials.

## Base URL

```
Production: https://api.frauddetection.example.com
Development: http://localhost:3000
```

## Endpoints

### 1. Submit Transaction

Submit a transaction for fraud analysis.

**Endpoint:** `POST /api/transactions`

**Request Body:**
```json
{
  "customerId": "string",
  "amount": number,
  "currency": "PKR",
  "merchantCategory": "string",
  "merchantName": "string",
  "location": {
    "lat": number,
    "lng": number,
    "city": "string",
    "country": "string"
  },
  "deviceInfo": {
    "deviceId": "string",
    "ip": "string",
    "userAgent": "string"
  }
}
```

**Response:**
```json
{
  "transactionId": "uuid",
  "status": "approved | pending_verification",
  "fraudScore": number
}
```

**Status Codes:**
- `200`: Transaction processed successfully
- `400`: Invalid request data
- `401`: Unauthorized
- `500`: Server error

### 2. Get Transaction Status

Retrieve the status of a transaction.

**Endpoint:** `GET /api/transactions/:id`

**Response:**
```json
{
  "transactionId": "uuid",
  "status": "approved | pending_verification | rejected | blocked",
  "fraudScore": number,
  "verificationStatus": "verified | failed | null",
  "timestamp": "ISO8601"
}
```

### 3. Webhook Notifications

The system sends webhook notifications for transaction status updates.

**Webhook URL:** Configure in your tenant settings

**Payload:**
```json
{
  "event": "transaction.verified | transaction.rejected | account.blocked",
  "transactionId": "uuid",
  "customerId": "string",
  "status": "string",
  "timestamp": "ISO8601"
}
```

## Rate Limits

- 100 requests per minute per tenant
- Burst limit: 200 requests

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Integration Example (Node.js)

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000';
const JWT_TOKEN = 'your_jwt_token';

async function submitTransaction(transaction) {
  try {
    const response = await axios.post(
      `${API_URL}/api/transactions`,
      transaction,
      {
        headers: {
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Transaction submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Example usage
submitTransaction({
  customerId: 'cust_123',
  amount: 15000,
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
    userAgent: 'Mozilla/5.0...'
  }
});
```

## Support

For API support, contact: support@frauddetection.example.com
