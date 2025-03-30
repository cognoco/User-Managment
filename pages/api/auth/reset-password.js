import { withSecurity } from '../../../middleware';
import { supabase } from '../../../lib/supabase.js';

/**
 * API endpoint for requesting a password reset
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
async function handler(req, res) {
  // Only allow POST method for password reset requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { email } = req.body;
    
    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    console.log('Password reset request for:', email);
    
    // Use Supabase to send the password reset email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: process.env.NEXT_PUBLIC_PASSWORD_RESET_REDIRECT_URL || 'http://localhost:5173/reset-password',
    });

    if (error) {
      console.error('Supabase password reset error:', error);
      return res.status(400).json({ error: error.message || 'Password reset request failed' });
    }

    // Return success message - even if the email doesn't exist (for security)
    return res.status(200).json({ 
      message: 'Password reset instructions have been sent to your email' 
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({ error: 'Password reset request failed' });
  }
}

// Export with ES module syntax
export default withSecurity(handler);