# User Management System

A comprehensive user management system built with Next.js and Supabase.

# ⚠️ IMPORTANT: MISSING CONFIGURATION ⚠️

**REDIS IS NOT CONFIGURED YET**

The rate limiting functionality requires Redis, which has not been configured. The application will function without it (rate limiting will be automatically disabled), but for full functionality:

1. Obtain Redis URL and token from your Redis provider (Upstash, Redis Labs, etc.)
2. Add to `.env` file:
   ```
   REDIS_URL=your-redis-url
   REDIS_TOKEN=your-redis-token
   ```

## Configuration Status

⚠️ **IMPORTANT: Configuration Requirements**

This application requires the following external services to be fully operational:

1. **Supabase** ✅ - **CONFIGURED**
   - Project URL and API keys have been set up
   - Used for authentication and data storage

2. **Redis** ❌ - **NOT CONFIGURED**
   - Redis URL and token need to be provided
   - Used for rate limiting functionality
   - Rate limiting will be automatically disabled until Redis is configured
   - Set up `REDIS_URL` and `REDIS_TOKEN` in your `.env` file

If rate limiting functionality is required, please configure the Redis connection in the environment variables.

## Repository Structure

This repository contains two separate but related applications:

1. **Root Directory (Next.js Application)**:
   - A server-side rendered application built with Next.js
   - Primarily used for the API layer and server-side functionality
   - Runs on port 3000 by default
   - Start with `npm run dev` from the root directory
   - Environment variables needed in `.env`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```

2. **Project Directory (React/Vite Application)**:
   - A client-side application built with React, TypeScript, and Vite
   - Contains the modern UI components and client-side functionality
   - Runs on port 5173 by default
   - Start with `cd project && npm run dev` from the root directory
   - Environment variables needed in `project/.env`:
     ```
     VITE_API_URL=http://localhost:3000/api
     VITE_SUPABASE_URL=https://your-project-url.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

### Important Notes:
- Each application has its own package.json and dependencies
- The applications are designed to work together, with the Next.js app providing API endpoints
- For full functionality, both applications need to be running simultaneously
- Avoid running both applications on the same port
- When deploying, you'll need to consider both applications
- Both applications require Supabase configuration in their respective environment files

### Running the Applications:

```bash
# To run the Next.js API layer (root directory)
npm run dev

# In a separate terminal, to run the React/Vite frontend (project directory)
cd project && npm run dev
```

## Environment Setup

This project uses environment variables to manage configuration and sensitive information. Follow these steps to set up your environment:

1. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (CONFIGURED)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key (CONFIGURED)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (private, server-side only)

   You can find these values in your Supabase dashboard under Project Settings > API.

3. **Redis Configuration (MISSING - OPTIONAL):**
   - `REDIS_URL`: Your Redis connection URL
   - `REDIS_TOKEN`: Your Redis authentication token
   
   These settings are used for rate limiting. The application will function without them, but rate limiting will be disabled.

4. Create a separate `.env` file in the `project` directory:
   ```bash
   cd project
   ```
   Then create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:3000/api
   VITE_SUPABASE_URL=https://izziigqgdurqsoyvajvu.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. For production deployment, set these environment variables in your hosting platform (Vercel, Netlify, etc.).

## Security Notes

- Never commit your `.env` file to version control
- The `.env.example` file serves as a template and should not contain real credentials
- The `SUPABASE_SERVICE_ROLE_KEY` has admin privileges and should only be used server-side
- The `NEXT_PUBLIC_` prefix makes variables available on the client side, so only use it for non-sensitive information

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Testing

The project includes a comprehensive test suite to ensure functionality works as expected.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run simple tests (recommended for initial setup)
npm run test:simple
```

### Testing Framework

This project uses two test runners to accommodate different parts of the codebase:

#### Vitest (for TypeScript tests in `project/src/`)
- Used for TypeScript components and stores
- Provides better TypeScript support and faster execution
- Used primarily for:
  - React components with TypeScript
  - Zustand stores
  - Complex state management tests

#### Jest (for JavaScript tests in `__tests__/`)
- Used for JavaScript components and utilities
- Maintains compatibility with existing test suite
- Used primarily for:
  - React components in JavaScript
  - API route testing
  - Middleware testing
  - Database operations

#### Test Organization
- TypeScript tests (`project/src/`): Use Vitest
- JavaScript tests (`__tests__/`): Use Jest

New tests should follow this pattern:
- For new TypeScript components/stores in `project/src/`: Use Vitest
- For new JavaScript components in root: Use Jest

We use the following testing utilities across both frameworks:
- React Testing Library for component testing
- Node-mocks-http for API route testing
- Mock implementations for Supabase client

### Test Coverage

Our tests cover:
- Authentication components and flows
- User profile management
- Admin API functionality
- Middleware authentication and authorization
- Database operations

For more detailed information about testing, see the [Testing Documentation](TESTING.md).

## Production

```bash
# Build for production
npm run build

# Start the production server
npm start
```

## Project Structure

```
├── components/         # React components
├── lib/                # Utility functions and libraries
├── middleware/         # Next.js middleware
├── pages/              # Next.js pages and API routes
├── public/             # Static assets
├── styles/             # CSS and styling
└── __tests__/          # Test files
    ├── components/     # Component tests
    ├── lib/            # Library tests
    ├── middleware/     # Middleware tests
    └── pages/          # Page and API tests
```

## Documentation

- [Testing Documentation](TESTING.md) - Detailed information about testing strategy and implementation
- [Deployment Guide](docs/DEPLOYMENT.md) - Instructions for deploying to production 