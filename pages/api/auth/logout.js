import { withSecurity } from '../../../middleware';
import { supabase } from '../../../lib/supabase.js';
import { withAuth } from '../../../middleware/auth.js';

/**
 * API endpoint for user logout
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
async function handler(req, res) {
  // Only allow POST method for logout
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    console.log('Logout attempt');
    
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Sign out the user from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase logout error:', error);
      return res.status(500).json({ error: error.message || 'Logout failed' });
    }

    return res.status(200).json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
  }
}

// Combine withAuth and withSecurity middleware
// First apply security headers, then verify authentication
export default withSecurity(withAuth(handler));