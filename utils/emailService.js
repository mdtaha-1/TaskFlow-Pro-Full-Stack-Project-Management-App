import nodemailer from 'nodemailer';
import { sendSupabaseInvitation, sendSupabaseCustomEmail } from './supabaseEmailService.js';

// Create email transporter
const createTransporter = () => {
  console.log('🔧 Creating email transporter...');
  console.log('📧 EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  console.log('📧 NODE_ENV:', process.env.NODE_ENV);

  // Supabase email service (RECOMMENDED)
  if (process.env.EMAIL_SERVICE === 'supabase') {
    console.log('🔧 Using Supabase email service');
    return {
      sendMail: async (mailOptions) => {
        // Extract invitation data from mail options
        const invitationData = mailOptions.invitationData || {};
        
        return await sendSupabaseInvitation({
          to: mailOptions.to,
          inviterName: invitationData.inviterName || 'Team Member',
          inviterEmail: invitationData.inviterEmail || 'team@taskflowpro.com',
          role: invitationData.role || 'developer',
          message: invitationData.message || '',
          token: invitationData.token || '',
          invitationUrl: invitationData.invitationUrl || '#'
        });
      }
    };
  }

  // For development, log emails to console instead of sending
  if (!process.env.EMAIL_SERVICE || process.env.EMAIL_SERVICE === 'development') {
    console.log('🔧 Using development mode - emails will be logged to console');
    return {
      sendMail: async (mailOptions) => {
        console.log('\n📧 =============== EMAIL WOULD BE SENT ===============');
        console.log('📬 To:', mailOptions.to);
        console.log('📝 Subject:', mailOptions.subject);
        console.log('👤 From:', mailOptions.from);
        console.log('📄 Content Preview:');
        console.log('---------------------------------------------------');
        // Extract text content from HTML for preview
        const textContent = mailOptions.html
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 200) + '...';
        console.log(textContent);
        console.log('---------------------------------------------------');
        console.log('🔗 Full HTML content available in email template');
        console.log('⚠️  NOTE: In development mode, emails are logged here instead of being sent');
        console.log('⚠️  To actually send emails, configure EMAIL_SERVICE in your .env file');
        console.log('⚠️  RECOMMENDED: Use EMAIL_SERVICE=supabase for reliable email delivery');
        console.log('===============================================\n');
        
        return { 
          messageId: 'dev-' + Date.now(),
          accepted: [mailOptions.to],
          rejected: [],
          response: 'Email logged to console (development mode)'
        };
      }
    };
  }

  // Gmail configuration
  if (process.env.EMAIL_SERVICE === 'gmail') {
    console.log('🔧 Configuring Gmail transporter...');
    console.log('📧 Gmail User:', process.env.EMAIL_USER);
    console.log('📧 Gmail From:', process.env.EMAIL_FROM);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Gmail configuration incomplete! Missing EMAIL_USER or EMAIL_PASS');
      throw new Error('Gmail configuration incomplete');
    }

    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use App Password for Gmail
      },
      debug: true, // Enable debug logging
      logger: true // Enable logger
    });
  }

  // Fallback to console logging
  console.log('⚠️  No valid EMAIL_SERVICE configured, falling back to console logging');
  console.log('⚠️  RECOMMENDED: Use EMAIL_SERVICE=supabase for reliable email delivery');
  return {
    sendMail: async (mailOptions) => {
      console.log('\n📧 =============== EMAIL FALLBACK ===============');
      console.log('📬 To:', mailOptions.to);
      console.log('📝 Subject:', mailOptions.subject);
      console.log('👤 From:', mailOptions.from);
      console.log('⚠️  Configure EMAIL_SERVICE in your .env file to actually send emails');
      console.log('⚠️  Supported services: supabase (recommended), gmail, development');
      console.log('===============================================\n');
      return { 
        messageId: 'fallback-' + Date.now(),
        accepted: [mailOptions.to],
        rejected: [],
        response: 'Email logged to console (fallback mode)'
      };
    }
  };
};

// Send invitation email
export const sendInvitationEmail = async ({
  to,
  inviterName,
  inviterEmail,
  role,
  message,
  token,
  invitationUrl
}) => {
  console.log('📧 Preparing to send invitation email...');
  console.log('📧 To:', to);
  console.log('📧 From:', inviterName, '(' + inviterEmail + ')');
  console.log('📧 Role:', role);
  console.log('📧 Invitation URL:', invitationUrl);

  try {
    // If using Supabase, send directly
    if (process.env.EMAIL_SERVICE === 'supabase') {
      console.log('📧 Using Supabase email service...');
      return await sendSupabaseInvitation({
        to,
        inviterName,
        inviterEmail,
        role,
        message,
        token,
        invitationUrl
      });
    }

    // For other email services, use the transporter
    const transporter = createTransporter();

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited to Join TaskFlow Pro</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
          .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .invitation-box { background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0; border-left: 4px solid #3b82f6; }
          .role-badge { display: inline-block; background-color: #3b82f6; color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; margin: 8px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
          .footer { background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { color: #64748b; font-size: 14px; margin: 0; }
          .link { color: #3b82f6; text-decoration: none; }
          .message-box { background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f59e0b; }
          .warning-box { background-color: #fef2f2; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #ef4444; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 TaskFlow Pro</h1>
            <p>Project Management Platform</p>
          </div>
          
          <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 16px;">You're Invited to Join Our Team!</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join their team on TaskFlow Pro.
            </p>
            
            <div class="invitation-box">
              <h3 style="color: #1e293b; margin: 0 0 12px 0;">Invitation Details</h3>
              <p style="color: #475569; margin: 4px 0;"><strong>Role:</strong> <span class="role-badge">${role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}</span></p>
              <p style="color: #475569; margin: 4px 0;"><strong>Invited by:</strong> ${inviterName}</p>
              <p style="color: #475569; margin: 4px 0;"><strong>Organization:</strong> ${inviterEmail.split('@')[1]}</p>
            </div>
            
            ${message ? `
            <div class="message-box">
              <h4 style="color: #92400e; margin: 0 0 8px 0;">Personal Message:</h4>
              <p style="color: #92400e; margin: 0; font-style: italic;">"${message}"</p>
            </div>
            ` : ''}
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              TaskFlow Pro is a powerful project management platform that helps teams collaborate, track progress, and deliver exceptional results.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${invitationUrl}" class="cta-button">Accept Invitation & Join Team</a>
            </div>
            
            <div class="warning-box">
              <h4 style="color: #dc2626; margin: 0 0 8px 0;">⚠️ Email Delivery Notice</h4>
              <p style="color: #dc2626; margin: 0; font-size: 14px;">
                If you don't see this email in your inbox, please check your <strong>spam/junk folder</strong>. 
                Sometimes invitation emails are filtered by email providers.
              </p>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
              This invitation will expire in 7 days. If you can't click the button above, copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
              ${invitationUrl}
            </p>
            
            <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <h4 style="color: #1e293b; margin: 0 0 8px 0;">What you'll get:</h4>
              <ul style="color: #475569; margin: 0; padding-left: 20px;">
                <li>Access to team projects and tasks</li>
                <li>Real-time collaboration tools</li>
                <li>Advanced analytics and reporting</li>
                <li>Mobile and desktop access</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>
              This invitation was sent by ${inviterName} via TaskFlow Pro.<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
            <p style="margin-top: 16px;">
              <a href="#" class="link">Privacy Policy</a> • 
              <a href="#" class="link">Terms of Service</a> • 
              <a href="#" class="link">Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"TaskFlow Pro" <${process.env.EMAIL_FROM || 'noreply@taskflowpro.com'}>`,
      to,
      subject: `🎯 You're invited to join ${inviterName}'s team on TaskFlow Pro`,
      html: emailTemplate,
      invitationData: {
        inviterName,
        inviterEmail,
        role,
        message,
        token,
        invitationUrl
      }
    };

    console.log('📧 Mail options prepared:');
    console.log('📧 From:', mailOptions.from);
    console.log('📧 To:', mailOptions.to);
    console.log('📧 Subject:', mailOptions.subject);

    console.log('📧 Attempting to send email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('📧 Accepted:', result.accepted);
    console.log('📧 Rejected:', result.rejected);
    
    // Additional logging for debugging email delivery
    if (!process.env.EMAIL_SERVICE || process.env.EMAIL_SERVICE === 'development') {
      console.log('📧 DEVELOPMENT MODE: Email was logged to console instead of being sent');
      console.log('📧 To actually send emails, configure EMAIL_SERVICE in your .env file');
      console.log('📧 RECOMMENDED: Use EMAIL_SERVICE=supabase for reliable email delivery');
    } else {
      console.log('📧 Email sent via:', process.env.EMAIL_SERVICE);
      console.log('📧 If recipient doesn\'t receive email, check:');
      console.log('   - Spam/junk folder');
      console.log('   - Email service configuration');
      console.log('   - Email provider limits');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    
    // Provide specific error guidance
    if (process.env.EMAIL_SERVICE === 'supabase') {
      console.error('❌ SUPABASE ERROR: Check your Supabase configuration');
      console.error('   - Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct');
      console.error('   - Ensure email provider is configured in Supabase dashboard');
      console.error('   - Check Authentication > Settings > SMTP settings');
    } else if (error.code === 'EAUTH') {
      console.error('❌ AUTHENTICATION ERROR: Check your email credentials');
      console.error('   - For Gmail: Use App Password, not regular password');
      console.error('   - Enable 2FA and generate App Password: https://myaccount.google.com/apppasswords');
    } else if (error.code === 'ENOTFOUND') {
      console.error('❌ NETWORK ERROR: Check your internet connection and email service configuration');
    } else if (error.responseCode === 535) {
      console.error('❌ INVALID CREDENTIALS: Email/password combination is incorrect');
    }
    
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
};

// Send welcome email after user joins
export const sendWelcomeEmail = async ({ to, name, inviterName }) => {
  console.log('📧 Preparing to send welcome email to:', to);
  
  try {
    const transporter = createTransporter();

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to TaskFlow Pro!</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
          .content { padding: 40px 30px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to TaskFlow Pro!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name}!</h2>
            <p>Welcome to the team! You've successfully joined ${inviterName}'s workspace on TaskFlow Pro.</p>
            <p>You can now access all team projects, collaborate on tasks, and track progress together.</p>
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="cta-button">Go to Dashboard</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"TaskFlow Pro" <${process.env.EMAIL_FROM || 'noreply@taskflowpro.com'}>`,
      to,
      subject: '🎉 Welcome to TaskFlow Pro!',
      html: emailTemplate
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('❌ Welcome email sending failed:', error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
};