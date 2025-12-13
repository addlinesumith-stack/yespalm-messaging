// Vercel Serverless Function to send OTP via email
// Uses Ethereal Email (Nodemailer's free testing service)
const nodemailer = require('nodemailer');

// Create a transporter using Ethereal Email
// Ethereal is a fake SMTP provider that doesn't require authentication
// Perfect for testing email functionality
let transporter;

const initializeTransporter = async () => {
  if (!transporter) {
    // Create test account - this is a free service
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

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

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Initialize transporter
    const mail = await initializeTransporter();
    
    // Send email with OTP
    const info = await mail.sendMail({
      from: '"YesPalm OTP" <noreply@yespalm.com>',
      to: email,
      subject: 'YesPalm - Your OTP Code',
      html: `
        <h2>YesPalm - Secure Login</h2>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="color: #2e7d32; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p><strong>Important:</strong> Never share this code with anyone.</p>
        <hr />
        <p><small>If you didn't request this code, please ignore this email.</small></p>
      `,
    });
    
    console.log('OTP sent successfully to', email);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      testMessageUrl: nodemailer.getTestMessageUrl(info),
      otp: otp, // Include OTP in response for testing (remove in production)
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send OTP',
      details: error.message,
    });
  }
}
