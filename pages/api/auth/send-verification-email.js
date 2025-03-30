import { withSecurity } from '../../../middleware';
import { supabase } from '../../../lib/supabase.js';
import { withAuth } from '../../../middleware/auth.js';

/**
 * API endpoint for sending verification email
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
async function handler(req, res) {
  // Only allow POST method for sending verification emails
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // This endpoint requires authentication
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'You must be logged in to request a verification email' });
    }
    
    console.log('Verification email request for user ID:', user.id);
    
    // Use Supabase to send the verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        redirectTo: process.env.NEXT_PUBLIC_VERIFICATION_REDIRECT_URL || 'http://localhost:5173/verify-email',
      }
    });

    if (error) {
      console.error('Supabase verification email error:', error);
      return res.status(400).json({ error: error.message || 'Failed to send verification email' });
    }

    // Return success message
    return res.status(200).json({ 
      message: 'Verification email has been sent' 
    });
    
  } catch (error) {
    console.error('Verification email error:', error);
    return res.status(500).json({ error: 'Failed to send verification email' });
  }
}

// Combine withAuth and withSecurity middleware
export default withSecurity(withAuth(handler));