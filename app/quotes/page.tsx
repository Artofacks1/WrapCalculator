'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Navigation from '@/components/layout/Navigation';
import { canSaveQuotes } from '@/lib/subscription';
import type { User } from '@supabase/supabase-js';
import type { VehicleBucket, WrapType, JobType, WrapCategory, SubscriptionTier } from '@/lib/types';
import Card from '@/components/ui/Card';

interface Quote {
  id: string;
  vehicle_bucket: VehicleBucket;
  wrap_type: WrapType;
  job_type: JobType;
  wrap_category: WrapCategory;
  retail: number;
  customer_name: string | null;
  created_at: string;
}

export default function QuotesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch subscription tier
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        // Handle error gracefully - user record might not exist yet
        if (userError && userError.code !== 'PGRST116') {
          console.error('Error fetching user subscription tier:', userError);
        }

        if (userData) {
          setSubscriptionTier(userData.subscription_tier as SubscriptionTier);
        }

        // Fetch quotes if user can save quotes
        if (canSaveQuotes(userData?.subscription_tier as SubscriptionTier)) {
          fetchQuotes(user.id);
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchQuotes = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('id, vehicle_bucket, wrap_type, job_type, wrap_category, retail, customer_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setQuotes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatVehicleBucket = (bucket: VehicleBucket): string => {
    return bucket
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatWrapType = (type: WrapType): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatJobType = (type: JobType): string => {
    switch (type) {
      case 'PRINT_AND_INSTALL':
        return 'Print + Install';
      case 'INSTALL_ONLY':
        return 'Install Only';
      case 'PRINT_ONLY':
        return 'Print Only';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <Navigation currentPage="quotes" />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-body-sm text-gray-600">Loading quotes...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navigation currentPage="quotes" />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-body-base text-gray-900 mb-4">Please sign in to view your quotes</p>
              <Link
                href="/calculator"
                className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors duration-300"
              >
                Go to Calculator
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!canSaveQuotes(subscriptionTier)) {
    return (
      <>
        <Navigation currentPage="quotes" />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <p className="text-body-base text-gray-900 mb-4">Upgrade to Pro or Shop to save and view quotes</p>
              <Link
                href="/calculator"
                className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors duration-300"
              >
                Go to Calculator
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation currentPage="quotes" />
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-hero-heading text-gray-900">My Quotes</h1>
              <p className="text-body-sm text-gray-600 mt-2">
                View and manage your saved quotes
              </p>
            </div>
            <Link
              href="/calculator"
              className="px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow"
            >
              New Quote
            </Link>
          </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-body-sm text-red-600">{error}</p>
          </div>
        )}

        {quotes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-body-base text-gray-900 mb-4">No quotes yet</p>
            <p className="text-body-sm text-gray-600 mb-6">
              Create and save your first quote using the calculator
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors duration-300"
            >
              Create Quote
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {quotes.map((quote) => (
              <Card key={quote.id} className="hover:shadow-md transition-all duration-300 hover:border-teal-200">
                <Link href={`/quotes/${quote.id}`} className="block">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-card-heading text-gray-900">
                        {quote.customer_name || 'Unnamed Quote'}
                      </h3>
                      <span className="px-3 py-1 bg-gray-100 text-body-sm text-gray-600 rounded-full">
                        {quote.wrap_category === 'COLOR_CHANGE' ? 'Color Change' : 'Commercial Print'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-900">Vehicle:</span>{' '}
                        {formatVehicleBucket(quote.vehicle_bucket)}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Type:</span>{' '}
                        {formatWrapType(quote.wrap_type)}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Job:</span>{' '}
                        {formatJobType(quote.job_type)}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Date:</span>{' '}
                        {formatDate(quote.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-body-sm text-gray-600 mb-1">Total Price</div>
                    <div className="text-section-heading text-teal-600 font-semibold">
                      ${quote.retail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
        </div>
      </main>
    </>
  );
}

