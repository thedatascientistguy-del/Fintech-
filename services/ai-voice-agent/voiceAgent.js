const axios = require('axios');
const OpenAI = require('openai');
const { logger } = require('../../shared/utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

class VoiceAgent {
  constructor() {
    this.conversations = new Map();
  }

  async generateGreeting(transactionId, language = 'urdu') {
    const greetings = {
      urdu: 'السلام علیکم۔ میں آپ کے بینک کی طرف سے کال کر رہا ہوں۔ ہم نے آپ کے اکاؤنٹ میں ایک لین دین دیکھا ہے۔ براہ کرم تصدیق کے لیے اپنے شناختی کارڈ کے آخری دو نمبر بتائیں۔',
      english: 'Hello. I am calling from your bank. We have detected a transaction on your account. Please provide the last two digits of your CNIC for verification.'
    };

    const greeting = greetings[language] || greetings.english;

    return `
      <Response>
        <Say voice="Polly.Aditi" language="ur-IN">${greeting}</Say>
        <Gather input="speech" action="/api/voice/input?transactionId=${transactionId}" 
                speechTimeout="3" language="ur-PK">
        </Gather>
      </Response>
    `;
  }

  async processInput(speechResult, transactionId) {
    try {
      // Extract digits from speech
      const digits = this.extractDigits(speechResult);
      
      if (!digits || digits.length !== 2) {
        return `
          <Response>
            <Say voice="Polly.Aditi" language="ur-IN">
              معاف کیجیے، میں نے آپ کو صحیح طریقے سے نہیں سنا۔ براہ کرم دوبارہ کوشش کریں۔
            </Say>
            <Gather input="speech" action="/api/voice/input?transactionId=${transactionId}" 
                    speechTimeout="3" language="ur-PK">
            </Gather>
          </Response>
        `;
      }

      // Verify with verification service
      const verifyResponse = await axios.post(
        `http://localhost:${process.env.VERIFICATION_SERVICE_PORT}/api/verify/cnic`,
        {
          transactionId,
          cnicInput: digits
        }
      );

      const { status, attemptsRemaining } = verifyResponse.data;

      if (status === 'verified') {
        return `
          <Response>
            <Say voice="Polly.Aditi" language="ur-IN">
              شکریہ۔ آپ کی لین دین کی تصدیق ہو گئی ہے۔ اللہ حافظ۔
            </Say>
            <Hangup/>
          </Response>
        `;
      } else if (status === 'blocked') {
        return `
          <Response>
            <Say voice="Polly.Aditi" language="ur-IN">
              تصدیق ناکام ہو گئی۔ آپ کا اکاؤنٹ عارضی طور پر بلاک کر دیا گیا ہے۔ براہ کرم اپنی برانچ سے رابطہ کریں۔
            </Say>
            <Hangup/>
          </Response>
        `;
      } else {
        return `
          <Response>
            <Say voice="Polly.Aditi" language="ur-IN">
              غلط نمبر۔ آپ کے پاس ${attemptsRemaining} کوششیں باقی ہیں۔ براہ کرم دوبارہ کوشش کریں۔
            </Say>
            <Gather input="speech" action="/api/voice/input?transactionId=${transactionId}" 
                    speechTimeout="3" language="ur-PK">
            </Gather>
          </Response>
        `;
      }

    } catch (error) {
      logger.error('Voice processing error:', error);
      return `
        <Response>
          <Say voice="Polly.Aditi" language="ur-IN">
            معاف کیجیے، ایک خرابی پیش آ گئی۔ براہ کرم دوبارہ کوشش کریں۔
          </Say>
          <Hangup/>
        </Response>
      `;
    }
  }

  extractDigits(text) {
    // Extract digits from Urdu or English speech
    const digitMap = {
      'zero': '0', 'صفر': '0',
      'one': '1', 'ایک': '1',
      'two': '2', 'دو': '2',
      'three': '3', 'تین': '3',
      'four': '4', 'چار': '4',
      'five': '5', 'پانچ': '5',
      'six': '6', 'چھ': '6',
      'seven': '7', 'سات': '7',
      'eight': '8', 'آٹھ': '8',
      'nine': '9', 'نو': '9'
    };

    let result = '';
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (digitMap[word]) {
        result += digitMap[word];
      } else if (/^\d$/.test(word)) {
        result += word;
      }
    }

    return result.slice(0, 2);
  }
}

module.exports = VoiceAgent;
