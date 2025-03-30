import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserType } from '@/lib/types/user-type';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlatformComponent } from '@/lib/UserManagementProvider';
import { Check, X } from 'lucide-react';

// Base registration schema
const baseRegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Private user schema
const privateUserSchema = baseRegistrationSchema.extend({
  userType: z.literal(UserType.PRIVATE),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Corporate user schema
const corporateUserSchema = baseRegistrationSchema.extend({
  userType: z.literal(UserType.CORPORATE),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  position: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
});

// Combined schema with refinement for password matching
const registrationSchema = z.discriminatedUnion('userType', [
  privateUserSchema,
  corporateUserSchema,
]).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

// Password requirements component
interface PasswordRequirementProps {
  meets: boolean;
  text: string;
}

function PasswordRequirement({ meets, text }: PasswordRequirementProps) {
  return (
    <div className="flex items-center space-x-2">
      {meets ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className={`text-sm ${meets ? 'text-green-500' : 'text-red-500'}`}>{text}</span>
    </div>
  );
}

function PasswordRequirements({ password }: { password: string }) {
  // Define all password requirements
  const requirements = [
    { 
      meets: password.length >= 8, 
      text: 'At least 8 characters'
    },
    { 
      meets: /[A-Z]/.test(password), 
      text: 'At least one uppercase letter'
    },
    { 
      meets: /[a-z]/.test(password), 
      text: 'At least one lowercase letter'
    },
    { 
      meets: /[0-9]/.test(password), 
      text: 'At least one number'
    }
  ];

  // Only show requirements when there's any input
  if (password.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2 p-3 border rounded bg-slate-50">
      <div className="text-sm font-medium mb-1">Password must have:</div>
      {requirements.map((requirement, index) => (
        <PasswordRequirement
          key={index}
          meets={requirement.meets}
          text={requirement.text}
        />
      ))}
    </div>
  );
}

export function RegistrationForm() {
  const { corporateUsers } = useUserManagement();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [userType, setUserType] = useState<UserType>(corporateUsers.defaultUserType);
  
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      userType: corporateUsers.defaultUserType,
      acceptTerms: false,
    },
    mode: 'onChange', // Validate on change for real-time feedback
  });
  
  // Watch password field to validate requirements in real-time
  const password = form.watch('password') || '';
  const confirmPassword = form.watch('confirmPassword') || '';
  
  const onSubmit = async (data: RegistrationFormValues) => {
    // Create company object for corporate users
    const company = data.userType === UserType.CORPORATE ? {
      name: data.companyName,
      position: data.position,
      industry: data.industry,
      size: data.companySize,
    } : undefined;
    
    // Register user with backend
    await registerUser(data.email, data.password);
    
    // Note: Additional user data like firstName, lastName, etc. would need to be
    // saved in a separate profile update API call after registration is complete.
    // For now, we're just calling the basic register function with email and password.
  };
  
  // Switch user type and reset related fields
  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    form.setValue('userType', type);
    
    // Reset company-related fields when switching to private
    if (type === UserType.PRIVATE) {
      form.setValue('companyName', '');
      form.setValue('position', '');
      form.setValue('industry', '');
      form.setValue('companySize', undefined);
    }
  };
  
  // Only show user type selection if corporate users feature is enabled
  const showUserTypeSelection = corporateUsers.enabled && corporateUsers.registrationEnabled;
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <p className="text-muted-foreground">
          Register for a new account to get started
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* User Type Selection */}
        {showUserTypeSelection && (
          <div className="space-y-2">
            <Label>User Type</Label>
            <RadioGroup 
              defaultValue={corporateUsers.defaultUserType} 
              value={userType}
              onValueChange={(value) => handleUserTypeChange(value as UserType)}
              className="flex space-x-4"
              aria-label="User Type"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserType.PRIVATE} id="private" />
                <Label htmlFor="private">Private User</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserType.CORPORATE} id="corporate" />
                <Label htmlFor="corporate">Corporate User</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        {/* Email & Password Fields - Common for both user types */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="email@example.com" 
            {...form.register('email')} 
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              {...form.register('firstName')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              {...form.register('lastName')} 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            {...form.register('password')} 
          />
          <PasswordRequirements password={password} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            {...form.register('confirmPassword')} 
          />
          {password && confirmPassword && password !== confirmPassword && (
            <p className="text-destructive text-sm">Passwords do not match</p>
          )}
        </div>
        
        {/* Corporate User Fields */}
        {userType === UserType.CORPORATE && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/20">
            <h3 className="font-medium">Company Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input 
                id="companyName" 
                {...form.register('companyName')} 
              />
              {userType === UserType.CORPORATE && 
                // @ts-ignore - companyName error exists when userType is CORPORATE
                form.formState.errors.companyName?.message && (
                <p className="text-destructive text-sm">
                  {/* @ts-ignore */}
                  {form.formState.errors.companyName.message}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input 
                  id="position" 
                  {...form.register('position')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input 
                  id="industry" 
                  {...form.register('industry')} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <select
                id="companySize"
                className="w-full px-3 py-2 border rounded-md"
                {...form.register('companySize')}
              >
                <option value="">Select Company Size</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Terms and Conditions */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="acceptTerms"
            checked={form.watch('acceptTerms')}
            onCheckedChange={(checked) => 
              form.setValue('acceptTerms', checked === true)
            }
          />
          <label htmlFor="acceptTerms" className="text-sm">
            I agree to the Terms and Conditions
          </label>
        </div>
        {form.formState.errors.acceptTerms && (
          <p className="text-destructive text-sm">{form.formState.errors.acceptTerms.message}</p>
        )}
        
        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Loading..." : "Create Account"}
        </Button>
        
        <p className="text-center text-sm">
          Already have an account? <a href="/login" className="underline">Sign in</a>
        </p>
      </form>
    </div>
  );
} 