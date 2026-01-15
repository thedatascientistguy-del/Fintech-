class Transaction {
  constructor(data) {
    this.id = data.id;
    this.tenantId = data.tenantId; // Bank/Wallet ID
    this.customerId = data.customerId;
    this.amount = data.amount; // PKR
    this.currency = data.currency || 'PKR';
    this.merchantCategory = data.merchantCategory;
    this.merchantName = data.merchantName;
    this.location = data.location; // { lat, lng, city, country }
    this.deviceInfo = data.deviceInfo; // { deviceId, ip, userAgent }
    this.timestamp = data.timestamp || new Date();
    this.status = data.status || 'pending'; // pending, approved, rejected, blocked
    this.fraudScore = data.fraudScore || 0;
    this.verificationStatus = data.verificationStatus || null; // null, verified, failed
    this.verificationAttempts = data.verificationAttempts || 0;
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      customerId: this.customerId,
      amount: this.amount,
      currency: this.currency,
      merchantCategory: this.merchantCategory,
      merchantName: this.merchantName,
      location: this.location,
      deviceInfo: this.deviceInfo,
      timestamp: this.timestamp,
      status: this.status,
      fraudScore: this.fraudScore,
      verificationStatus: this.verificationStatus,
      verificationAttempts: this.verificationAttempts
    };
  }
}

module.exports = Transaction;
