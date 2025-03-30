import { withSecurity } from '../../../middleware';
import { supabase } from '../../../lib/supabase.js';

/**
 * API endpoint for verifying user email
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
async function handler(req, res) {
  // Only allow POST method for email verification
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { token } = req.body;
    
    // Validate required fields
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    console.log('Email verification attempt with token:', token);
    
    // Use Supabase to verify the email using the token
    // Note: Supabase handles email verification via redirects, 
    // this endpoint might be for custom verification flows or confirming status.
    // Let's assume this endpoint confirms the verification status after the user clicks the link.
    
    // For a real implementation, you might need to exchange the token 
    // or simply redirect the user to a success page after Supabase handles verification.
    // This example assumes the token is used to fetch the user status.
    
    // Example: Fetch user based on a verification token (if your setup uses this)
    // This is a placeholder - Supabase's default flow doesn't typically require this.
    // const { data: { user }, error } = await supabase.auth.verifyOtp({ token, type: 'email' });
    
    // if (error) {
    //   console.error('Supabase email verification error:', error);
    //   return res.status(400).json({ error: error.message || 'Email verification failed' });
    // }

    // Mock success response for now, as Supabase handles the actual verification
    return res.status(200).json({ 
      message: 'Email verification successful (mock response)',
      // user: user // Include user data if verification returns it
    });
    
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ error: 'Email verification failed' });
  }
}

// Export with ES module syntax
export default withSecurity(handler);