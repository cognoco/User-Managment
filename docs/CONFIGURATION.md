# Configuration Management

This document explains how configuration is managed across both the Next.js backend and React frontend applications.

## Centralized Configuration Approach

We've implemented a centralized configuration approach to avoid duplication and ensure consistency. Configuration values are defined in central files that access environment variables and provide them through exported objects.

### Benefits:

- **Single source of truth**: Configuration values are defined once and reused across the codebase
- **Validation**: Required environment variables are checked at startup
- **Type safety**: Configuration objects provide type hints to prevent errors
- **Defaults**: Sensible defaults are provided when environment variables are missing
- **Environment-specific behavior**: Different values can be used in development, test, and production

## Configuration Files

### Backend (Next.js)

The backend configuration is managed in `lib/config.js`, which exports:

- `supabaseConfig`: Supabase connection details (URL, API keys)
- `redisConfig`: Redis connection details (URL, token)
- `apiConfig`: API settings (base URL, timeout)
- `authConfig`: Authentication settings (token expiry, cookie names)
- `rateLimitConfig`: Rate limiting settings (request limits, time windows)
- Environment detection helpers: `isProduction`, `isDevelopment`, `isTest`
- `validateConfig()`: Function to check required environment variables

### Frontend (React/Vite)

The frontend configuration is managed in `project/src/lib/config.ts`, which exports similar objects adapted for the frontend environment.

## Environment Variables

### Backend Environment Variables

Required in `.env` and `.env.production`:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-only)

Optional:
- `REDIS_URL`: URL for Redis connection (used for rate limiting)
- `REDIS_TOKEN`: Authentication token for Redis
- `API_TIMEOUT`: API request timeout in milliseconds (default: 10000)
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds (default: 900000)
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 100)
- `TOKEN_EXPIRY_DAYS`: JWT token expiry in days (default: 7)
- `SESSION_COOKIE_NAME`: Name for the session cookie (default: 'user-management-session')

### Frontend Environment Variables

Required in `project/.env`:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key

Optional:
- `VITE_API_URL`: API base URL (default: 'http://localhost:3000/api' in dev, 'https://api.example.com' in prod)
- `VITE_API_TIMEOUT`: API request timeout in milliseconds (default: 10000)
- `VITE_TOKEN_EXPIRY_DAYS`: JWT token expiry in days (default: 7)

## Using Configuration Values

### In Backend Code

```javascript
import { supabaseConfig, redisConfig, apiConfig } from '@/lib/config';

// Use configuration values
const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);

// Example of conditional usage based on configuration
if (redisConfig.enabled) {
  // Initialize Redis connection
  const redis = new Redis({
    url: redisConfig.url,
    token: redisConfig.token,
  });
}
```

### In Frontend Code

```typescript
import { supabaseConfig, apiConfig } from '../config';

// Use configuration values
const supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey);
```

## Adding New Configuration Values

To add new configuration options:

1. Add the environment variable to the appropriate `.env` files
2. Add the variable to the corresponding config object in `lib/config.js` or `project/src/lib/config.ts`
3. If the variable is required, add it to the validation function
4. Use the configuration value in your code by importing from the config file 