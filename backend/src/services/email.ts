import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { authConfig } from '../config/auth.js';

// Email transporter configuration
let transporter: Transporter;

/**
 * Initialize email transporter
 */
export function initializeEmailService(): void {
  // In development, use ethereal email for testing
  // In production, use actual SMTP credentials
  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // For development, create a test account
    // You can also manually configure ethereal credentials
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'your-test-email@ethereal.email',
        pass: process.env.SMTP_PASSWORD || 'your-test-password',
      },
    });
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  to: string,
  username: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;

  try {
    const info = await transporter.sendMail({
      from: `"${authConfig.email.fromName}" <${authConfig.email.from}>`,
      to,
      subject: 'Verify Your BetDuel Account',
      html: getVerificationEmailTemplate(username, verificationUrl),
      text: `Welcome to BetDuel, ${username}!\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.`,
    });

    console.log('Verification email sent:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  try {
    const info = await transporter.sendMail({
      from: `"${authConfig.email.fromName}" <${authConfig.email.from}>`,
      to,
      subject: 'Reset Your BetDuel Password',
      html: getPasswordResetEmailTemplate(username, resetUrl),
      text: `Hi ${username},\n\nYou requested to reset your password. Click this link to reset it: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
    });

    console.log('Password reset email sent:', info.messageId);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(
  to: string,
  username: string
): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"${authConfig.email.fromName}" <${authConfig.email.from}>`,
      to,
      subject: 'Welcome to BetDuel!',
      html: getWelcomeEmailTemplate(username),
      text: `Welcome to BetDuel, ${username}!\n\nYour account has been verified successfully. You can now start competing and wagering!\n\nGood luck and have fun!`,
    });

    console.log('Welcome email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw error for welcome email - it's not critical
  }
}

/**
 * Verification email HTML template
 */
function getVerificationEmailTemplate(username: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">BetDuel</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Welcome, ${username}!</h2>
        <p>Thanks for signing up for BetDuel. To get started, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #667eea; font-size: 14px; word-break: break-all;">${verificationUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours. If you didn't create an account, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Password reset email HTML template
 */
function getPasswordResetEmailTemplate(username: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">BetDuel</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
        <p>Hi ${username},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #667eea; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Welcome email HTML template
 */
function getWelcomeEmailTemplate(username: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to BetDuel</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">BetDuel</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Welcome to BetDuel, ${username}!</h2>
        <p>Your account has been verified successfully. You're now ready to start competing and wagering!</p>
        <h3 style="color: #667eea; margin-top: 30px;">What's Next?</h3>
        <ul style="line-height: 2;">
          <li>Complete your profile</li>
          <li>Connect your gaming accounts</li>
          <li>Join or create matches</li>
          <li>Compete and earn credits</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">Good luck and have fun!</p>
      </div>
    </body>
    </html>
  `;
}

// Initialize the email service
initializeEmailService();
