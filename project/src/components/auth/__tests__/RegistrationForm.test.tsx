import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { RegistrationForm } from '../RegistrationForm';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useUserManagement } from '@/lib/UserManagementProvider';

// Mock the auth store
vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

// Mock the UserManagementProvider
vi.mock('@/lib/UserManagementProvider', () => ({
  useUserManagement: vi.fn(),
  PlatformComponent: ({ web }) => web,
}));

describe('RegistrationForm', () => {
  const mockRegister = vi.fn();
  const mockCorporateUsers = {
    enabled: true,
    registrationEnabled: true,
    defaultUserType: 'private',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup auth store mock
    useAuthStore.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
    });
    
    // Setup UserManagementProvider mock
    useUserManagement.mockReturnValue({
      corporateUsers: mockCorporateUsers,
    });
  });

  it('renders the registration form', () => {
    render(<RegistrationForm />);
    
    // Check for form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/terms and conditions/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid inputs', async () => {
    render(<RegistrationForm />);
    
    // Submit the form without filling in required fields
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('calls register function with valid inputs', async () => {
    render(<RegistrationForm />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Password123' },
    });
    
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password123' },
    });
    
    // Accept terms
    fireEvent.click(screen.getByLabelText(/terms and conditions/i));
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check if register function was called
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'Password123');
    });
  });

  it('shows corporate fields when corporate user type is selected', async () => {
    render(<RegistrationForm />);
    
    // Select corporate user type
    fireEvent.click(screen.getByLabelText(/corporate user/i));
    
    // Check for corporate-specific fields
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/industry/i)).toBeInTheDocument();
  });

  it('shows error message when registration fails', () => {
    // Setup auth store with error
    useAuthStore.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: 'Registration failed',
    });
    
    render(<RegistrationForm />);
    
    // Check for error message
    expect(screen.getByText('Registration failed')).toBeInTheDocument();
  });

  it('disables form submission when loading', () => {
    // Setup auth store with loading state
    useAuthStore.mockReturnValue({
      register: mockRegister,
      isLoading: true,
      error: null,
    });
    
    render(<RegistrationForm />);
    
    // Check that submit button is disabled
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });
});