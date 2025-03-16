import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['project/src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['project/src/**/*.{ts,tsx}'],
      exclude: ['project/src/**/*.{test,spec}.{ts,tsx}']
    }
  },
  resolve: {
    alias: {
      '@': '/project/src'
    }
  }
}); 