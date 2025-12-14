// Vercel Serverless Function to send OTP via email
// Uses SendGrid for production-grade email delivery
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Check if SendGrid API key is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      res.status(500).json({
        error: 'Email service not configured',
        message: 'SENDGRID_API_KEY environment variable is not set',
      });
      return;
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Prepare email message
    const msg = {
      to: email,
    from: process.env.SENDGRID_FROM_EMAIL || 'addlinesumith@gmail.com',     subject: 'YesPalm - Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2e7d32; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🌴 YesPalm</h1>
            <p style="color: #c8e6c9; margin: 5px 0 0 0;">Secure Anonymous Messaging</p>
          </div>
          <div style="background-color: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #2e7d32; margin-top: 0;">Secure Login</h2>
            <p style="color: #666; font-size: 16px;">Your One-Time Password (OTP) is:</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #2e7d32; font-size: 48px; letter-spacing: 8px; margin: 0; font-weight: bold; font-family: 'Courier New', monospace;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 14px;">
              <strong>This code will expire in 10 minutes.</strong>
            </p>
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-weight: bold;">⚠️ Security Warning</p>
              <p style="color: #856404; margin: 5px 0 0 0; font-size: 14px;">Never share this code with anyone. YesPalm support staff will never ask for your OTP.</p>
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
              If you didn't request this code, please ignore this email or reset your account password immediately.
            </p>
          </div>
          <div style="background-color: #2e7d32; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0;">
            <p style="margin: 0;">© 2025 YesPalm. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `,
    };
    
    // Send email via SendGrid
    await sgMail.send(msg);
        // Store OTP in Redis
    await storeOTPInRedis(email, otp);
    
    console.log(`OTP sent successfully to ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Provide detailed error logging
    if (error.response) {
      console.error('SendGrid error response:', error.response.body);
    }
    
    res.status(500).json({
      error: 'Failed to send OTP',
      message: 'Unable to send OTP at this moment. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
