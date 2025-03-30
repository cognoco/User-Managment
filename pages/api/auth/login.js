import { withSecurity } from '../../../middleware';
import { supabase } from '../../../lib/supabase.js';

/**
 * API endpoint for user login
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
async function handler(req, res) {
  // Only allow POST method for login
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    console.log('Login attempt:', email);
    
    // Use Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ error: error.message || 'Authentication failed' });
    }

    // Return user and token
    return res.status(200).json({
      user: data.user,
      token: data.session.access_token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}

// Export with ES module syntax
export default withSecurity(handler);