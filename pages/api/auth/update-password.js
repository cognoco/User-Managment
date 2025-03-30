import { withSecurity } from '../../../middleware';
import { supabase } from '../../../lib/supabase.js';
import { withAuth } from '../../../middleware/auth.js';

/**
 * API endpoint for updating user password
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
async function handler(req, res) {
  // Only allow POST method for password updates
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // This endpoint requires authentication
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'You must be logged in to update your password' });
    }
    
    const { oldPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }
    
    // Make sure the new password meets minimum requirements
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    console.log('Password update attempt for user ID:', user.id);
    
    // First verify the old password is correct by attempting to sign in
    // Note: This is not ideal, Supabase doesn't have a direct "verifyPassword" method.
    // A better approach might involve custom logic or database checks if needed.
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });

    if (signInError) {
      // Don't leak specific error messages, just indicate failure
      return res.status(401).json({ error: 'Current password verification failed' });
    }
    
    // Update the password using Supabase
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Supabase password update error:', error);
      return res.status(400).json({ error: error.message || 'Password update failed' });
    }

    return res.status(200).json({ 
      message: 'Password updated successfully' 
    });
    
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ error: 'Password update failed' });
  }
}

// Combine withAuth and withSecurity middleware
export default withSecurity(withAuth(handler));