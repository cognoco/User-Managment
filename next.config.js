/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // You can add additional environment variables here if needed
  },
  // Ensure environment variables are available at build time
  publicRuntimeConfig: {
    // Will be available on both server and client
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  // Improved webpack configuration to handle the project directory properly
  webpack: (config, { isServer }) => {
    // In server-side builds, we need to exclude the Vite project to avoid conflicts
    if (isServer) {
      // More precise externals configuration
      const projectExternals = ['project/src/**/*'];
      
      if (Array.isArray(config.externals)) {
        config.externals = [...config.externals, ...projectExternals];
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = (ctx, callback) => {
          if (projectExternals.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
            return regex.test(ctx.request);
          })) {
            return callback(null, 'commonjs ' + ctx.request);
          }
          return originalExternals(ctx, callback);
        };
      } else {
        config.externals = [...(config.externals ? [config.externals] : []), ...projectExternals];
      }
    }
    
    return config;
  },
  // Ensure proper handling of ES modules
  experimental: {
    esmExternals: true,
  }
}

export default nextConfig;