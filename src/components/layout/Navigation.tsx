import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { canSaveQuotes } from '@/lib/subscription';
import type { User } from '@supabase/supabase-js';
import type { SubscriptionTier } from '@/lib/types';
import Logo from '@/components/landing/Logo';
import AuthButton from '@/components/AuthButton';

interface NavigationProps {
  currentPage?: 'home' | 'pricing' | 'signup' | 'calculator' | 'quotes';
}

/**
 * Reusable Navigation Component
 * Provides consistent navigation across all pages
 */
export default function Navigation({ currentPage }: NavigationProps) {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setSubscriptionTier(userData.subscription_tier as SubscriptionTier);
        }
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUser();
      } else {
        setSubscriptionTier('FREE');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        <nav className="flex items-center gap-4">
          <Link
            to="/"
            className={`text-body-base font-medium transition-colors ${
              currentPage === 'home'
                ? 'text-teal-600 font-semibold'
                : 'text-gray-700 hover:text-teal-600'
            }`}
          >
            Home
          </Link>
          <Link
            to="/calculator"
            className={`text-body-base font-medium transition-colors ${
              currentPage === 'calculator'
                ? 'text-teal-600 font-semibold'
                : 'text-gray-700 hover:text-teal-600'
            }`}
          >
            WrapQuote APP
          </Link>
          {user && canSaveQuotes(subscriptionTier) && (
            <Link
              to="/quotes"
              className={`px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow ${
                currentPage === 'quotes' ? 'bg-teal-50' : ''
              }`}
            >
              My Quotes
            </Link>
          )}
          <AuthButton />
        </nav>
      </div>
    </header>
  );
}

