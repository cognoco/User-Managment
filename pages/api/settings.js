import { withSecurity } from '../../middleware';

/**
 * API endpoint for user settings
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
async function handler(req, res) {
  // Add CORS headers
  const origin = req.headers.origin;
  if (origin && origin.includes('localhost')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      // Return mock settings
      return res.status(200).json({
        theme: 'light',
        notifications: {
          email: true,
          push: false,
          sms: false
        },
        language: 'en',
        timezone: 'UTC',
        appName: "User Management System",
        version: "0.1.0",
        features: {
          darkMode: true,
          multilingual: true,
          analytics: false
        },
        userSettings: {
          defaultTheme: "light",
          defaultLanguage: "en"
        }
      });
      
    case 'PUT':
      // Update settings
      try {
        const newSettings = req.body;
        console.log('Updating settings:', newSettings);
        
        // Return the updated settings (would usually save to database)
        return res.status(200).json({
          ...newSettings,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Settings update error:', error);
        return res.status(500).json({ error: 'Failed to update settings' });
      }
      
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'OPTIONS']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}

// Export handler with ES module syntax
export default withSecurity(handler); 