import { withSecurity } from '../../../middleware';
import { supabase } from '../../../lib/supabase.js';

/**
 * API endpoint for user registration
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
async function handler(req, res) {
  // Only allow POST method for registration
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
    
    // Validate password length to match frontend requirements
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    console.log('Registration attempt:', email);
    
    // Use Supabase to register the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.NEXT_PUBLIC_VERIFICATION_REDIRECT_URL || 'http://localhost:5173/verify-email',
      }
    });
    
    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ error: error.message || 'Registration failed' });
    }
    
    // Return user and session data
    return res.status(200).json({
      user: data.user,
      token: data.session?.access_token || null
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

// Export with ES module syntax
export default withSecurity(handler);