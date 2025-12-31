

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface OnboardingModalProps {
  userEmail: string;
  isEmailVerified: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ userEmail, isEmailVerified, onComplete }: OnboardingModalProps) {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    if (!isEmailVerified) {
      setError('Please verify your email address before continuing');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not found');
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: userEmail,
          full_name: fullName.trim(),
          company_name: companyName.trim(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (updateError) throw updateError;

      // Also update auth.users metadata if needed
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          company_name: companyName.trim(),
        }
      });

      if (authError) throw authError;

      // Call onComplete and wait for it to finish before clearing loading state
      try {
        await onComplete();
        // Success - loading will be cleared when modal closes
      } catch (onCompleteError: any) {
        // If onComplete fails, log it but don't show error to user
        // The parent component will handle the error state
        console.error('Error in onComplete callback:', onCompleteError);
        throw new Error('Profile saved but failed to refresh. Please refresh the page.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setSendingVerification(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=/app`,
        },
      });
      if (error) {
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          throw new Error('Too many requests. Please wait a few minutes before trying again.');
        }
        throw error;
      }
      setError(null);
      alert('Verification email sent! Please check your inbox and spam folder. If you still don\'t see it, check your Supabase email settings.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setSendingVerification(false);
    }
  };

  const handleCheckVerification = async () => {
    setError(null);
    try {
      // Refresh the session to check if email was verified
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user?.email_confirmed_at) {
        alert('Email verified! You can now complete your profile.');
        // Refresh the page to update the verification status
        window.location.reload();
      } else {
        setError('Email not yet verified. Please check your inbox for the confirmation link.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check verification status');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <h2 className="text-section-heading text-gray-900 mb-4">
          Complete Your Profile
        </h2>
        <p className="text-body-sm text-gray-600 mb-6">
          Please provide your information to start using WrapQuote.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              label="Email Address"
              type="email"
              value={userEmail}
              disabled
              className="bg-gray-50"
            />
            {!isEmailVerified && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-body-sm text-yellow-800 mb-3">
                  Your email address is not verified. Please check your inbox for a verification link.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleResendVerification}
                    disabled={sendingVerification}
                    className="text-body-sm py-2 flex-1"
                  >
                    {sendingVerification ? 'Sending...' : 'Resend Email'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCheckVerification}
                    className="text-body-sm py-2 flex-1"
                  >
                    Check Status
                  </Button>
                </div>
                <details className="text-body-sm text-yellow-700">
                  <summary className="cursor-pointer font-semibold mb-1">Troubleshooting</summary>
                  <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                    <li>Check spam/junk folder</li>
                    <li>Verify email confirmations are enabled in Supabase Dashboard</li>
                    <li>Check Supabase → Authentication → Settings → Email templates</li>
                    <li>In development, emails may be auto-confirmed</li>
                  </ul>
                </details>
              </div>
            )}
          </div>

          <div className="mb-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="mb-6">
            <Input
              label="Company Name"
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Wrap Company"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-body-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !isEmailVerified || !fullName.trim() || !companyName.trim()}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

