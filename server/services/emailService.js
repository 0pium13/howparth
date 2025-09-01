const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configure nodemailer fallback
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

class EmailService {
  static async sendEmail(to, subject, html, text) {
    try {
      if (process.env.SENDGRID_API_KEY) {
        // Use SendGrid
        const msg = {
          to,
          from: process.env.FROM_EMAIL || 'noreply@howparth.com',
          subject,
          html,
          text,
        };
        
        await sgMail.send(msg);
        logger.info(`Email sent via SendGrid to: ${to}`);
      } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use nodemailer
        const mailOptions = {
          from: process.env.FROM_EMAIL || process.env.SMTP_USER,
          to,
          subject,
          html,
          text,
        };
        
        await transporter.sendMail(mailOptions);
        logger.info(`Email sent via SMTP to: ${to}`);
      } else {
        // Development fallback - log email content
        logger.info('Email would be sent in production:', {
          to,
          subject,
          html: html.substring(0, 100) + '...',
        });
      }
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  static async sendVerificationEmail(email, username, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    const subject = 'Verify your HOWPARTH account';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome to HOWPARTH!</h2>
        <p>Hi ${username},</p>
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          HOWPARTH - AI-Powered Content Creation Platform
        </p>
      </div>
    `;
    
    const text = `
      Welcome to HOWPARTH!
      
      Hi ${username},
      
      Thanks for signing up! Please verify your email address by visiting:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you didn't create an account, you can safely ignore this email.
      
      HOWPARTH - AI-Powered Content Creation Platform
    `;
    
    await this.sendEmail(email, subject, html, text);
  }

  static async sendPasswordResetEmail(email, username, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset your HOWPARTH password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Password Reset Request</h2>
        <p>Hi ${username},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          HOWPARTH - AI-Powered Content Creation Platform
        </p>
      </div>
    `;
    
    const text = `
      Password Reset Request
      
      Hi ${username},
      
      We received a request to reset your password. Visit this link to create a new password:
      ${resetUrl}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      HOWPARTH - AI-Powered Content Creation Platform
    `;
    
    await this.sendEmail(email, subject, html, text);
  }
}

module.exports = EmailService;
