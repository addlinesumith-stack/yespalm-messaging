// Vercel Serverless Function to send OTP via email
// For production, use a service like SendGrid, Mailgun, or AWS SES

const nodemailer = require('nodemailer');

// For demo purposes, we'll use environment variables
// Set these in Vercel dashboard: EMAIL_USER, EMAIL_PASS
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@yespalm.com',
      to: email,
      subject: 'YesPalm - Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">YesPalm</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Anonymous Messaging</p>
          </div>
          <div style="background: #f9f9f9; padding: 40px; text-align: center; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Your OTP Verification Code</h2>
            <p style="color: #666; margin-bottom: 30px;">Please use the following OTP to verify your email:</p>
            <div style="background: white; border: 2px solid #667eea; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
}
