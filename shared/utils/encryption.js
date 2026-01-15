const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32));

class Encryption {
  static encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  static decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      KEY,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  static maskCNIC(cnic) {
    if (!cnic || cnic.length < 2) return '**';
    return '***********' + cnic.slice(-2);
  }

  static maskPhone(phone) {
    if (!phone || phone.length < 4) return '****';
    return '****' + phone.slice(-4);
  }
}

module.exports = Encryption;
