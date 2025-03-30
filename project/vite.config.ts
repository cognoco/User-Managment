/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Also try to load env from parent directory (for Next.js env variables)
  const parentEnv = loadEnv(mode, path.resolve(__dirname, '..'), '');
  
  // Merge environments, with project env taking precedence
  const mergedEnv = { ...parentEnv, ...env };
  
  // Map Next.js env variables to Vite format if they exist
  const supabaseUrl = mergedEnv.VITE_SUPABASE_URL || mergedEnv.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = mergedEnv.VITE_SUPABASE_ANON_KEY || mergedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiUrl = mergedEnv.VITE_API_URL || mergedEnv.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  
  console.log('Vite config - Using API URL:', apiUrl);
  console.log('Vite config - Using Supabase URL:', supabaseUrl);
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Define environment variables
    define: {
      // Supabase configuration
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      
      // API configuration
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
    server: {
      // Configure proxy for API requests to avoid CORS issues
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  };
});
