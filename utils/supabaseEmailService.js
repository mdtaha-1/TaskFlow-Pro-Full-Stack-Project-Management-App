import { getSupabase, isSupabaseConfigured } from './supabaseClient.js';

// Send invitation email using Supabase Auth
export const sendSupabaseInvitation = async ({
  to,
  inviterName,
  inviterEmail,
  role,
  message,
  token,
  invitationUrl
}) => {
  console.log('📧 Preparing to send Supabase invitation email...');
  console.log('📧 To:', to);
  console.log('📧 From:', inviterName, '(' + inviterEmail + ')');
  console.log('📧 Role:', role);
  console.log('📧 Invitation URL:', invitationUrl);

  if (!isSupabaseConfigured()) {
    console.log('⚠️  Supabase not configured, falling back to console logging...');
    
    console.log('\n📧 =============== SUPABASE EMAIL INVITATION ===============');
    console.log('📬 To:', to);
    console.log('📝 Subject: You\'re invited to join ' + inviterName + '\'s team on TaskFlow Pro');
    console.log('👤 From:', inviterName + ' (' + inviterEmail + ')');
    console.log('🎯 Role:', role);
    console.log('🔗 Invitation URL:', invitationUrl);
    if (message) {
      console.log('💬 Personal Message:', message);
    }
    console.log('⚠️  NOTE: Configure Supabase credentials to send actual emails');
    console.log('⚠️  Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file');
    console.log('========================================================\n');
    
    return { 
      messageId: 'supabase-dev-' + Date.now(),
      accepted: [to],
      rejected: [],
      response: 'Email logged to console (Supabase not configured)'
    };
  }

  const supabase = getSupabase();
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    console.log('📧 Attempting to send email via Supabase...');

    // Use Supabase's built-in email functionality
    // Note: This requires Supabase Auth to be properly configured with an email provider
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(to, {
      data: {
        inviter_name: inviterName,
        inviter_email: inviterEmail,
        role: role,
        message: message,
        invitation_url: invitationUrl,
        custom_template: true
      },
      redirectTo: invitationUrl
    });

    if (error) {
      console.error('❌ Supabase email error:', error);
      
      // If it's a configuration error, fall back to console logging
      if (error.message.includes('SMTP') || error.message.includes('email') || error.message.includes('template')) {
        console.log('🔄 Falling back to console logging due to Supabase email configuration...');
        
        console.log('\n📧 =============== SUPABASE EMAIL INVITATION (FALLBACK) ===============');
        console.log('📬 To:', to);
        console.log('📝 Subject: You\'re invited to join ' + inviterName + '\'s team on TaskFlow Pro');
        console.log('👤 From:', inviterName + ' (' + inviterEmail + ')');
        console.log('🎯 Role:', role);
        console.log('🔗 Invitation URL:', invitationUrl);
        if (message) {
          console.log('💬 Personal Message:', message);
        }
        console.log('⚠️  NOTE: Supabase email provider not configured');
        console.log('⚠️  Configure SMTP settings in Supabase Dashboard > Authentication > Settings');
        console.log('========================================================================\n');
        
        return {
          messageId: 'supabase-fallback-' + Date.now(),
          accepted: [to],
          rejected: [],
          response: 'Email logged to console (Supabase email not configured)'
        };
      }
      
      throw new Error(`Supabase email failed: ${error.message}`);
    }

    console.log('✅ Supabase invitation sent successfully!');
    console.log('📧 Supabase response:', data);

    return {
      messageId: data?.user?.id || 'supabase-' + Date.now(),
      accepted: [to],
      rejected: [],
      response: 'Email sent via Supabase Auth',
      supabaseData: data
    };

  } catch (error) {
    console.error('❌ Supabase email sending failed:', error);
    console.error('❌ Error details:', error.message);
    
    // Provide specific error guidance
    console.error('❌ SUPABASE ERROR: Check your Supabase configuration');
    console.error('   - Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct');
    console.error('   - Ensure email provider is configured in Supabase dashboard');
    console.error('   - Check Authentication > Settings > SMTP settings');
    console.error('   - Verify email templates are enabled');
    
    throw new Error(`Failed to send Supabase invitation: ${error.message}`);
  }
};

// Alternative: Send custom email using Supabase Edge Functions
export const sendSupabaseCustomEmail = async ({
  to,
  inviterName,
  inviterEmail,
  role,
  message,
  token,
  invitationUrl
}) => {
  console.log('📧 Sending custom email via Supabase Edge Function...');

  if (!isSupabaseConfigured()) {
    console.log('⚠️  Supabase not configured, logging email to console...');
    return sendSupabaseInvitation({ to, inviterName, inviterEmail, role, message, token, invitationUrl });
  }

  const supabase = getSupabase();
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    // Call a Supabase Edge Function to send the email
    const { data, error } = await supabase.functions.invoke('send-invitation-email', {
      body: {
        to,
        inviterName,
        inviterEmail,
        role,
        message,
        token,
        invitationUrl,
        subject: `🎯 You're invited to join ${inviterName}'s team on TaskFlow Pro`
      }
    });

    if (error) {
      console.error('❌ Supabase Edge Function error:', error);
      throw new Error(`Edge Function failed: ${error.message}`);
    }

    console.log('✅ Custom email sent via Supabase Edge Function!');
    return {
      messageId: data?.messageId || 'edge-function-' + Date.now(),
      accepted: [to],
      rejected: [],
      response: 'Email sent via Supabase Edge Function',
      edgeData: data
    };

  } catch (error) {
    console.error('❌ Supabase Edge Function failed:', error);
    
    // Fallback to built-in auth invitation
    console.log('🔄 Falling back to Supabase Auth invitation...');
    return sendSupabaseInvitation({ to, inviterName, inviterEmail, role, message, token, invitationUrl });
  }
};