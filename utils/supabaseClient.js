import { createClient } from '@supabase/supabase-js';

// Function to get Supabase configuration
const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('🔍 Supabase Config Check:');
  console.log('📧 EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  console.log('🔗 SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Missing ❌');
  console.log('🔑 SERVICE_KEY:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'Missing ❌');
  
  return {
    url: supabaseUrl,
    serviceKey: supabaseServiceKey,
    isConfigured: !!(supabaseUrl && supabaseServiceKey)
  };
};

// Lazy initialization of Supabase client
let supabaseClient = null;

export const getSupabase = () => {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    
    if (config.isConfigured) {
      console.log('✅ Supabase credentials found, initializing client...');
      try {
        supabaseClient = createClient(config.url, config.serviceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        console.log('✅ Supabase client initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
        supabaseClient = null;
      }
    } else {
      console.log('⚠️  Supabase credentials not configured. Email invitations will be logged to console.');
      console.log('⚠️  To enable email delivery, add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file');
      supabaseClient = null;
    }
  }
  
  return supabaseClient;
};

export const isSupabaseConfigured = () => {
  const config = getSupabaseConfig();
  return config.isConfigured;
};

// Legacy export for backward compatibility
export const supabase = getSupabase();