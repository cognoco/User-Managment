import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

// Get a Supabase instance with the service role key for admin operations
export function getServiceSupabase() {
  if (!supabaseConfig.serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  return createClient(
    supabaseConfig.url,
    supabaseConfig.serviceKey
  );
} 