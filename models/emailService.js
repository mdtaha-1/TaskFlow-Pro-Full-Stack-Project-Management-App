import crypto from 'crypto';

// Email service configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'TaskFlow Pro <noreply@taskflowpro.com>',
  baseUrl: process.env.CLIENT_URL || 'http://localhost:5173'
};

// Generate secure token
export const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Email templates
export const emailTemplates = {
  invitation: (inviterName, role, message, inviteLink) => ({
    subject: `You're invited to join TaskFlow Pro by ${inviterName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited to TaskFlow Pro</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { color: #e0e7ff; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
          .message { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; }
          .role-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; margin: 10px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .cta-button:hover { opacity: 0.9; }
          .personal-message { background: #f3f4f6; padding: 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
          .features { margin: 30px 0; }
          .feature { display: flex; align-items: center; margin: 15px 0; }
          .feature-icon { width: 20px; height: 20px; background: #10b981; border-radius: 50%; margin-right: 15px; }
          .feature-text { color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎯 TaskFlow Pro</div>
            <div class="subtitle">Project Management Platform</div>
          </div>
          
          <div class="content">
            <div class="greeting">You're Invited! 🎉</div>
            
            <div class="message">
              <strong>${inviterName}</strong> has invited you to join their team on TaskFlow Pro as a <span class="role-badge">${role.replace('-', ' ').toUpperCase()}</span>.
            </div>
            
            ${message ? `
              <div class="personal-message">
                <strong>Personal message from ${inviterName}:</strong><br>
                "${message}"
              </div>
            ` : ''}
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon"></div>
                <div class="feature-text">Collaborate on projects with your team</div>
              </div>
              <div class="feature">
                <div class="feature-icon"></div>
                <div class="feature-text">Track tasks and deadlines efficiently</div>
              </div>
              <div class="feature">
                <div class="feature-icon"></div>
                <div class="feature-text">Get insights with powerful analytics</div>
              </div>
              <div class="feature">
                <div class="feature-icon"></div>
                <div class="feature-text">Always free - no hidden costs</div>
              </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${inviteLink}" class="cta-button">Accept Invitation & Join Team</a>
            </div>
            
            <div class="message">
              This invitation will expire in 7 days. If you have any questions, feel free to reach out to ${inviterName}.
            </div>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by ${inviterName} through TaskFlow Pro.</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            <p>© 2024 TaskFlow Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      You're invited to join TaskFlow Pro!
      
      ${inviterName} has invited you to join their team as a ${role.replace('-', ' ')}.
      
      ${message ? `Personal message: "${message}"` : ''}
      
      Click here to accept: ${inviteLink}
      
      This invitation expires in 7 days.
      
      TaskFlow Pro - Project Management Platform
    `
  }),

  emailVerification: (userName, verificationLink) => ({
    subject: 'Verify your email address - TaskFlow Pro',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - TaskFlow Pro</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { color: #d1fae5; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
          .message { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 20px 0; }
          .cta-button:hover { opacity: 0.9; }
          .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
          .security-note { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎯 TaskFlow Pro</div>
            <div class="subtitle">Project Management Platform</div>
          </div>
          
          <div class="content">
            <div class="greeting">Welcome to TaskFlow Pro, ${userName}! 🚀</div>
            
            <div class="message">
              Thank you for joining TaskFlow Pro! To complete your registration and start collaborating with your team, please verify your email address.
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${verificationLink}" class="cta-button">Verify Email Address</a>
            </div>
            
            <div class="security-note">
              <strong>Security Note:</strong> This verification link will expire in 24 hours for your security.
            </div>
            
            <div class="message">
              Once verified, you'll have full access to:
              <ul>
                <li>Create and manage projects</li>
                <li>Collaborate with team members</li>
                <li>Track tasks and deadlines</li>
                <li>Access powerful analytics</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>If you didn't create an account with TaskFlow Pro, please ignore this email.</p>
            <p>© 2024 TaskFlow Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Welcome to TaskFlow Pro, ${userName}!
      
      Please verify your email address to complete your registration.
      
      Click here to verify: ${verificationLink}
      
      This link expires in 24 hours.
      
      TaskFlow Pro - Project Management Platform
    `
  }),

  accountDeleted: (userName) => ({
    subject: 'Your TaskFlow Pro account has been deleted',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Deleted - TaskFlow Pro</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; }
          .logo { color: white; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .subtitle { color: #fecaca; font-size: 16px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 24px; font-weight: 600; color: #1f2937; margin-bottom: 20px; }
          .message { font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; }
          .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎯 TaskFlow Pro</div>
            <div class="subtitle">Project Management Platform</div>
          </div>
          
          <div class="content">
            <div class="greeting">Account Deleted Successfully</div>
            
            <div class="message">
              Hi ${userName},<br><br>
              
              Your TaskFlow Pro account has been permanently deleted as requested. All your personal data has been removed from our systems.
            </div>
            
            <div class="message">
              <strong>What happens next:</strong>
              <ul>
                <li>Your personal data has been permanently deleted</li>
                <li>You will no longer receive emails from TaskFlow Pro</li>
                <li>Your access to all projects and teams has been revoked</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
            
            <div class="message">
              If you change your mind, you're always welcome to create a new account and rejoin the TaskFlow Pro community.
            </div>
            
            <div class="message">
              Thank you for being part of TaskFlow Pro. We're sorry to see you go! 👋
            </div>
          </div>
          
          <div class="footer">
            <p>This is an automated message confirming your account deletion.</p>
            <p>© 2024 TaskFlow Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Account Deleted Successfully
      
      Hi ${userName},
      
      Your TaskFlow Pro account has been permanently deleted as requested.
      
      What happens next:
      - Your personal data has been permanently deleted
      - You will no longer receive emails from TaskFlow Pro
      - Your access to all projects and teams has been revoked
      - This action cannot be undone
      
      Thank you for being part of TaskFlow Pro.
      
      TaskFlow Pro - Project Management Platform
    `
  })
};

// Mock email sending function (replace with real email service)
export const sendEmail = async (to, template) => {
  console.log('\n📧 EMAIL SENT:');
  console.log('To:', to);
  console.log('Subject:', template.subject);
  console.log('Content:', template.text);
  console.log('-------------------\n');
  
  // In production, integrate with services like:
  // - SendGrid: https://sendgrid.com/
  // - Mailgun: https://www.mailgun.com/
  // - AWS SES: https://aws.amazon.com/ses/
  // - Nodemailer with SMTP
  
  return { success: true, messageId: `mock-${Date.now()}` };
};