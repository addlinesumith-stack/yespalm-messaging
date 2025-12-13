// Vercel Serverless Function to send OTP via SMS using Twilio
const twilio = require('twilio');

// Get Twilio credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Create Twilio client
const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: 'Mobile number and OTP are required' });
  }

  try {
    // Send SMS via Twilio
    const message = await client.messages.create({
      body: `Your YesPalm OTP is: ${otp}. Do not share this with anyone.`,
      from: TWILIO_PHONE_NUMBER,
      to: mobile
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      sid: message.sid
    });
  } catch (error) {
    console.error('SMS sending error:', error);
    return res.status(500).json({
      error: 'Failed to send OTP',
      details: error.message
    });
  }
}
