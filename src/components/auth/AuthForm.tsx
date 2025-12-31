

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface AuthFormProps {
  initialMode?: 'signup' | 'signin';
  onSuccess?: () => void;
  showCard?: boolean;
  className?: string;
}

/**
 * Reusable Authentication Form Component
 * Handles both signup and signin with password confirmation
 * Can be used in modal or page context
 */
export default function AuthForm({ 
  initialMode = 'signup', 
  onSuccess,
  showCard = true,
  className 
}: AuthFormProps) {
  const [mode, setMode] = useState<'signup' | 'signin'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [userEmailForVerification, setUserEmailForVerification] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        // Validate password confirmation
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please try again.');
          setLoading(false);
          return;
        }

        // NOTE: Supabase signUp() does NOT return an error if email already exists
        // It returns success but won't send a confirmation email to existing users
        // To detect existing users, we check BEFORE attempting signup
        // by trying to sign in with a dummy password
        const { error: checkError, data: checkData } = await supabase.auth.signInWithPassword({
          email,
          password: '___check_if_user_exists___',
        });

        // Analyze the response to determine if user exists
        if (checkError) {
          const errorMsg = (checkError.message || '').toLowerCase();
          const errorCode = (checkError.code || '').toLowerCase();
          
          // User exists if we get:
          // - "Invalid login credentials" (wrong password, user exists)
          // - "Invalid email or password" (wrong password, user exists)
          // - "Email not confirmed" (user exists but not verified)
          // - "invalid_credentials" (error code for wrong password)
          if (
            errorMsg.includes('invalid login credentials') ||
            errorMsg.includes('invalid email or password') ||
            errorMsg.includes('email not confirmed') ||
            errorMsg.includes('email_not_confirmed') ||
            errorCode === 'invalid_credentials'
          ) {
            // User exists - show error immediately
            setError('Email is already used. Please sign in instead or use "Forgot Password" to reset your password.');
            setLoading(false);
            return;
          }
          // If error is "User not found" or other errors, user doesn't exist - proceed with signup
        } else if (checkData?.user) {
          // Signin succeeded (very unlikely with dummy password, but handle it)
          // If we got a user object, user exists
          await supabase.auth.signOut(); // Sign out immediately
          setError('Email is already used. Please sign in instead or use "Forgot Password" to reset your password.');
          setLoading(false);
          return;
        }

        // User doesn't exist, proceed with signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/calculator`,
          },
        });

        if (error) {
          // Check for explicit signup errors (rare, but handle them)
          if (
            error.message.includes('User already registered') ||
            error.message.includes('already registered') ||
            error.message.includes('Email address already registered') ||
            error.message.includes('already been registered') ||
            error.code === 'signup_disabled' ||
            error.message.toLowerCase().includes('already exists')
          ) {
            setError('Email is already used. Please sign in instead or use "Forgot Password" to reset your password.');
            setLoading(false);
            return;
          }
          throw error;
        }

        // Check if user was actually created
        if (!data.user) {
          setError('Email is already used. Please sign in instead or use "Forgot Password" to reset your password.');
          setLoading(false);
          return;
        }

        // Valid signup - user was created
        // Create user profile in database
        if (data.user) {
          // Create user profile using API utility
          try {
            const { createUserProfile } = await import('@/api/auth');
            await createUserProfile(data.user.id, email);
          } catch (err) {
            console.error('Error creating user profile:', err);
          }
        }

        setUserEmailForVerification(email);
        setMessage('Check your email for a confirmation link! If you don\'t see it, check your spam folder or click "Resend verification email" below.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Check if error is due to email not being confirmed
          if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
            setUserEmailForVerification(email);
            setError('Please verify your email address first. Check your inbox for the confirmation link, or click "Resend verification email" below.');
            return;
          }
          // Check if invalid credentials
          if (
            error.message.includes('Invalid login credentials') ||
            error.message.includes('Invalid email or password') ||
            error.message.includes('invalid_credentials')
          ) {
            setError('Invalid email or password. If you forgot your password, click "Forgot Password" below. Otherwise, please check your credentials and try again.');
            return;
          }
          throw error;
        }

        // Redirect to /app after successful sign in
        if (onSuccess) {
          onSuccess();
        }
        // If no onSuccess callback, redirect manually (for page context)
        if (!onSuccess) {
          window.location.href = '/calculator';
        }
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${mode === 'signup' ? 'sign up' : 'sign in'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userEmailForVerification) {
      setError('No email address to resend verification to');
      return;
    }

    setSendingVerification(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmailForVerification,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/app`,
        },
      });

      if (error) {
        // Check for specific errors
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          throw new Error('Too many requests. Please wait a few minutes before trying again.');
        }
        throw error;
      }

      setMessage('Verification email sent! Please check your inbox and spam folder. If you still don\'t see it, check your Supabase email settings.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!userEmailForVerification) return;
    
    setError(null);
    try {
      // Refresh the session to check if email was verified
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user?.email_confirmed_at) {
        setMessage('Email verified! You can now sign in.');
        // Clear the message after a delay and allow sign in
        setTimeout(() => {
          setMode('signin');
        }, 2000);
      } else {
        setError('Email not yet verified. Please check your inbox for the confirmation link.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check verification status');
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address first');
      return;
    }

    setResettingPassword(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?redirect=/calculator&type=recovery`,
      });

      if (error) throw error;

      setMessage('Password reset email sent! Check your inbox for instructions to reset your password.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setResettingPassword(false);
    }
  };

  const handleSwitchToSignIn = () => {
    setMode('signin');
    setError(null);
    setMessage(null);
  };

  const formContent = (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-section-heading text-gray-900 mb-2">
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </h1>
        <p className="text-body-base text-gray-600">
          {mode === 'signup'
            ? 'Start quoting wrap projects with ease'
            : 'Welcome back to WrapQuote'}
        </p>
      </div>

      {/* Error/Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-body-sm text-red-600 mb-3">{error}</p>
          {/* Show actions for specific error types */}
          {(error.includes('already used') || error.includes('already exists') || error.includes('already registered')) && (
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSwitchToSignIn}
                className="flex-1 text-body-sm"
              >
                Sign In Instead
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleForgotPassword}
                disabled={resettingPassword}
                className="flex-1 text-body-sm"
              >
                {resettingPassword ? 'Sending...' : 'Forgot Password'}
              </Button>
            </div>
          )}
          {error.includes('Invalid email or password') && (
            <div className="mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleForgotPassword}
                disabled={resettingPassword || !email}
                className="w-full text-body-sm"
              >
                {resettingPassword ? 'Sending...' : 'Forgot Password'}
              </Button>
            </div>
          )}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
          <p className="text-body-sm text-teal-600 mb-2">{message}</p>
          {userEmailForVerification && (
            <div className="mt-3 space-y-2">
              <p className="text-body-sm text-gray-700">
                <strong>Email:</strong> {userEmailForVerification}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleResendVerification}
                  disabled={sendingVerification}
                  className="flex-1 text-body-sm"
                >
                  {sendingVerification ? 'Sending...' : 'Resend Email'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCheckVerification}
                  className="flex-1 text-body-sm"
                >
                  Check Status
                </Button>
              </div>
              <div className="mt-3 pt-3 border-t border-teal-200">
                <p className="text-body-sm text-gray-600 font-semibold mb-1">Still not receiving emails?</p>
                <ul className="text-body-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Check your spam/junk folder</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
                minLength={8}
          placeholder="••••••••"
        />
        {mode === 'signup' && (
          <>
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
              <p className="text-body-sm text-gray-500">Must be at least 8 characters</p>
          </>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
            </>
          ) : (
            mode === 'signup' ? 'Create Account' : 'Sign In'
          )}
        </Button>
      </form>

      {/* Toggle mode */}
      <div className="mt-6 space-y-2 text-center">
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
            setMessage(null);
            setUserEmailForVerification(null);
            setConfirmPassword('');
          }}
          className="text-body-sm text-teal-600 hover:text-teal-700 font-medium block w-full"
        >
          {mode === 'signin' 
            ? "Don't have an account? Sign up"
            : 'Already have an account? Sign in'}
        </button>
        {mode === 'signin' && (
          <button
            onClick={handleForgotPassword}
            disabled={resettingPassword || !email}
            className="text-body-sm text-gray-600 hover:text-gray-700 font-medium block w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resettingPassword ? 'Sending password reset...' : 'Forgot Password?'}
          </button>
        )}
      </div>
    </>
  );

  if (showCard) {
    return (
      <Card className={className}>
        {formContent}
      </Card>
    );
  }

  return <div className={className}>{formContent}</div>;
}

