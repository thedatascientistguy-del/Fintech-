class Customer {
  constructor(data) {
    this.id = data.id;
    this.tenantId = data.tenantId;
    this.name = data.name;
    this.phone = data.phone;
    this.cnicLastTwo = data.cnicLastTwo; // Encrypted
    this.accountStatus = data.accountStatus || 'active'; // active, blocked, suspended
    this.blockedUntil = data.blockedUntil || null;
    this.transactionHistory = data.transactionHistory || [];
  }

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      phone: this.phone,
      accountStatus: this.accountStatus,
      blockedUntil: this.blockedUntil
      // Note: cnicLastTwo is never exposed in JSON
    };
  }
}

module.exports = Customer;
