'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Navigation from '@/components/layout/Navigation';
import AuthForm from '@/components/auth/AuthForm';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user is already signed in
  useEffect(() => {
    const next = searchParams.get('next') || '/app';
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push(next);
      }
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation currentPage="calculator" />
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <AuthForm initialMode="signin" className="w-full max-w-md" />
      </div>
    </div>
  );
}

/**
 * Login Page
 * Allows users to sign in and redirects to /app (or next parameter) after login
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-body-base text-gray-600">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

