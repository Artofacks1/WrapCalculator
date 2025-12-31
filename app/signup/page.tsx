'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Navigation from '@/components/layout/Navigation';
import AuthForm from '@/components/auth/AuthForm';

/**
 * Sign Up Page
 * Allows users to create an account and redirects to calculator after signup
 */
export default function SignUpPage() {
  const router = useRouter();

  // Check if user is already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push('/app');
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation currentPage="signup" />
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <AuthForm initialMode="signup" className="w-full max-w-md" />
      </div>
    </div>
  );
}
