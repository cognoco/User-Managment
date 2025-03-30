/**
 * Central configuration file for frontend services
 */

// Supabase Configuration
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
};

// Environment detection
export const isProduction = import.meta.env.MODE === 'production';
export const isDevelopment = import.meta.env.MODE === 'development';
export const isTest = import.meta.env.VITEST === 'true';

// API Configuration
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_URL as string || (isProduction ? 'https://api.example.com' : 'http://localhost:3000/api'),
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT as string || '10000', 10),
};

// Auth Configuration
export const authConfig = {
  tokenExpiryDays: parseInt(import.meta.env.VITE_TOKEN_EXPIRY_DAYS as string || '7', 10),
  storageKeyPrefix: 'user-mgmt',
};

// Environment validation - check required variables
export function validateConfig(): boolean {
  const requiredVariables = [
    { name: 'VITE_SUPABASE_URL', value: supabaseConfig.url },
    { name: 'VITE_SUPABASE_ANON_KEY', value: supabaseConfig.anonKey }
  ];

  const missingVariables = requiredVariables
    .filter(v => !v.value)
    .map(v => v.name);

  if (missingVariables.length > 0) {
    console.error(`Missing required environment variables: ${missingVariables.join(', ')}`);
    return false;
  }

  return true;
}

// Validate config immediately if not in test environment
if (!isTest) {
  validateConfig();
} 