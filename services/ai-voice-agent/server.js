require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const VoiceAgent = require('./voiceAgent');
const { logger, auditLogger } = require('../../shared/utils/logger');

const app = express();
const PORT = process.env.AI_VOICE_AGENT_PORT || 3003;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const voiceAgent = new VoiceAgent();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-voice-agent' });
});

// Initiate call
app.post('/api/call', async (req, res) => {
  try {
    const { transactionId, phone, language } = req.body;
    
    const call = await twilioClient.calls.create({
      url: `${process.env.PUBLIC_URL}/api/voice/twiml?transactionId=${transactionId}&language=${language}`,
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.PUBLIC_URL}/api/voice/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    });

    await auditLogger.log('call_initiated', {
      transactionId,
      callSid: call.sid,
      phone: phone.slice(-4)
    });

    logger.info(`Call initiated: ${call.sid} for transaction ${transactionId}`);
    
    res.json({ callSid: call.sid, status: 'initiated' });

  } catch (error) {
    logger.error('Call initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
});

// TwiML endpoint
app.post('/api/voice/twiml', async (req, res) => {
  const { transactionId, language } = req.query;
  
  const twiml = await voiceAgent.generateGreeting(transactionId, language);
  
  res.type('text/xml');
  res.send(twiml);
});

// Handle speech input
app.post('/api/voice/input', async (req, res) => {
  try {
    const { SpeechResult, CallSid, transactionId } = req.body;
    
    logger.info(`Speech input: ${SpeechResult} for transaction ${transactionId}`);
    
    const response = await voiceAgent.processInput(SpeechResult, transactionId);
    
    res.type('text/xml');
    res.send(response);

  } catch (error) {
    logger.error('Voice input processing error:', error);
    res.status(500).send('<Response><Say>An error occurred</Say></Response>');
  }
});

// Call status webhook
app.post('/api/voice/status', async (req, res) => {
  const { CallSid, CallStatus } = req.body;
  
  await auditLogger.log('call_status_update', {
    callSid: CallSid,
    status: CallStatus
  });
  
  logger.info(`Call ${CallSid} status: ${CallStatus}`);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  logger.info(`AI Voice Agent running on port ${PORT}`);
});

module.exports = app;
