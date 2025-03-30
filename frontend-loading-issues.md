# Frontend Loading Issues Analysis

## Critical Issues

### 1. Missing API Endpoints
The Vite frontend makes requests to API endpoints that don't exist in the Next.js backend.

**Affected Files:**
- `project/src/lib/stores/auth.store.ts` (lines 14, 33, 61, 75, 88, 101, 114, 135)
  - References endpoints like `/auth/login`, `/auth/logout`, etc.
- `pages/api/auth/` directory only contains:
  - `register.js` - All other required endpoints are missing

**Solution:**
- Create the missing API endpoints in the Next.js backend:
  ```
  /pages/api/auth/login.js
  /pages/api/auth/logout.js
  /pages/api/auth/reset-password.js
  /pages/api/auth/update-password.js
  /pages/api/auth/send-verification-email.js
  /pages/api/auth/verify-email.js
  ```

### 2. Module System Conflict
The project has a mixed module system which causes import/export conflicts.

**Affected Files:**
- `package.json` (line 70): `"type": "module"`
- `middleware/auth.js` (lines 1, 42): Uses CommonJS syntax

**Solution:**
- Convert `middleware/auth.js` to use ES modules:
  ```javascript
  import { supabase } from '../lib/supabase.js';
  export function withAuth() { ... }
  ```

### 3. Authentication Flow Mismatch
The frontend expects a custom authentication system, but the backend is set up to use Supabase directly.

**Affected Files:**
- `project/src/lib/stores/auth.store.ts`: Uses custom API routes
- `lib/supabase.js`: Direct Supabase authentication
- `pages/api/auth/register.js`: Returns mock data instead of using Supabase

**Solution:**
- Either:
  1. Update backend API endpoints to use Supabase auth and return proper tokens
  2. Or modify frontend to use Supabase client directly

### 4. CORS Configuration Issues
Multiple CORS implementations cause conflicts.

**Affected Files:**
- `middleware/cors.ts`: Global CORS middleware
- `pages/api/auth/register.js` (lines 11-18): Local CORS handling
- `middleware/index.ts` (lines 114-119): Additional CORS headers

**Solution:**
- Consolidate CORS handling to one place (preferably middleware)
- Make CORS more permissive in development

### 5. Environment Variable Inconsistency
Different naming conventions between Next.js and Vite.

**Affected Files:**
- `.env`: Uses `NEXT_PUBLIC_SUPABASE_URL`
- `project/.env`: Uses `VITE_SUPABASE_URL`
- `lib/config.js`: References Next.js variables
- `project/src/lib/config.ts`: References Vite variables

**Solution:**
- Create a unified environment variable mapping in Vite config

## Secondary Issues

### 6. Dependency Version Conflicts
Inconsistent library versions between projects.

**Affected Files:**
- `package.json`: Zustand v5.0.3, Axios v1.8.3
- `project/package.json`: Zustand v4.5.1, Axios v1.6.7

**Solution:**
- Standardize dependencies across both projects

### 7. Next.js Configuration Duplication
Multiple Next.js config files.

**Affected Files:**
- `next.config.js`
- `next.config.cjs`

**Solution:**
- Consolidate to a single configuration file

### 8. API Error Handling
Inconsistent error handling in API requests.

**Affected Files:**
- `project/src/lib/api/axios.ts`: Limited error handling
- `project/src/lib/stores/auth.store.ts`: Inconsistent error state management

**Solution:**
- Improve error handling in API client
- Add specific handling for CORS and network errors

## Implementation Plan

### Immediate Fixes

1. **Fix Module System**:
```javascript
// middleware/auth.js
import { supabase } from '../lib/supabase.js';

export function withAuth(handler, options = {}) {
  // ... existing implementation
}
```

2. **Create Required API Endpoints**:
Example for login.js:
```javascript
// pages/api/auth/login.js
import { withSecurity } from '../../../middleware';
import { supabase } from '../../../lib/supabase';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return res.status(200).json({
      user: data.user,
      token: data.session.access_token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({ error: error.message || 'Authentication failed' });
  }
}

export default withSecurity(handler);
```

3. **Standardize CORS Configuration**:
```typescript
// middleware/cors.ts - Updated for development
export function cors(options: CorsOptions = {}) {
  return async function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    const isLocalhost = origin && (origin.includes('localhost') || origin.includes('127.0.0.1'));
    
    if (origin && (process.env.NODE_ENV !== 'production' && isLocalhost)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    }
    
    // Rest of implementation...
  };
}
```

4. **Remove Individual CORS Handling** from API endpoints:
```javascript
// pages/api/auth/register.js - Remove custom CORS handling
async function handler(req, res) {
  // Remove lines 11-23 (CORS handling)
  
  // Only allow POST method for registration
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
  
  // Rest of implementation...
}
```

These changes will address the most critical issues preventing the frontend from functioning properly.