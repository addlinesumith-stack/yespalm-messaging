const { Redis } = require('@upstash/redis');

// OTP Verification Endpoint
// This endpoint verifies the OTP provided by the user
// In production, OTPs should be stored in Redis with TTL (Time To Live)
// For now, we'll use a simple in-memory store (NOT suitable for production)

// Initialize Redis client with Upstash
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});


export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    // In production, retrieve OTP from Redis
    // const storedOTP = await redis.get(`otp:${email}`);
    try {
    // Retrieve OTP from Redis
    const storedOTP = await redis.get(`otp:${email}`);
    console.log(`Retrieved OTP from Redis: ${storedOTP}`);

    // Check if OTP exists in Redis
    if (!storedOTP) {
      return res.status(401).json({ error: 'OTP not found or expired. Please request a new one.' });
    }

    // Check if OTP matches (string comparison)
    const otpMatch = otp === storedOTP;
    console.log(`OTP match: ${otpMatch}, provided: ${otp}, stored: ${storedOTP}`);

    if (!otpMatch) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    // OTP is valid - delete from Redis and return success
    await redis.del(`otp:${email}`);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      userId: Buffer.from(email).toString('base64') // Create a simple user ID
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}
  
    // OTP is valid - clean up and return success
    delete storedOTPs[email];
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      userId: Buffer.from(email).toString('base64') // Create a simple user ID
    });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}

// Helper function to store OTP (called from send-otp.js)
export function storeOTP(email, otp) {
  storedOTPs[email] = {
    code: otp,
    createdAt: new Date()
  };
}
