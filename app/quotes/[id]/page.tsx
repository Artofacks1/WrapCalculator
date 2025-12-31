'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import Navigation from '@/components/layout/Navigation';
import { canSaveQuotes, canExportQuotes } from '@/lib/subscription';
import type { User } from '@supabase/supabase-js';
import type { VehicleBucket, WrapType, JobType, WrapCategory, ComplexityToggle, SubscriptionTier } from '@/lib/types';
import Card from '@/components/ui/Card';

interface Quote {
  id: string;
  vehicle_bucket: VehicleBucket;
  wrap_type: WrapType;
  job_type: JobType;
  wrap_category: WrapCategory;
  roll_width_inches: number;
  waste_percent: number;
  complexity: ComplexityToggle;
  base_sqft: number;
  adjusted_sqft: number;
  linear_feet: number;
  base_hours: number;
  complexity_hours: number;
  total_labor_hours: number;
  material_cost: number;
  labor_cost: number;
  subtotal_cost: number;
  retail: number;
  profit_dollars: number;
  profit_margin: number;
  deposit_amount: number | null;
  labor_rate_per_hour: number | null;
  vinyl_cost_per_lf: number | null;
  print_cost_per_sqft: number | null;
  lam_cost_per_sqft: number | null;
  design_fee_flat: number | null;
  overhead_flat: number | null;
  pricing_mode: string;
  pricing_percent: number;
  customer_name: string | null;
  customer_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function QuoteDetailPage() {
  const params = useParams();
  const quoteId = params.id as string;

  const [, setUser] = useState<User | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchQuote = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (!data) {
        setError('Quote not found');
        return;
      }

      setQuote(data as Quote);
    } catch (err: any) {
      setError(err.message || 'Failed to load quote');
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
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

        if (canSaveQuotes(userData?.subscription_tier as SubscriptionTier)) {
          fetchQuote(user.id);
        } else {
          setError('Upgrade to Pro or Shop to view quotes');
          setLoading(false);
        }
      } else {
        setError('Please sign in to view quotes');
        setLoading(false);
      }
    };

    fetchUser();
  }, [quoteId, fetchQuote]);

  const handleExportQuote = () => {
    if (!quote) return;

    setExporting(true);

    const effectiveJobType = quote.wrap_category === 'COLOR_CHANGE' ? 'INSTALL_ONLY' : quote.job_type;
    
    const quoteText = `WrapQuote - ${new Date(quote.created_at).toLocaleDateString()}
    
${quote.wrap_category === 'COLOR_CHANGE'
  ? `Wrap Category: Color Change (Solid Vinyl) - Install Only`
  : `Job Type: ${effectiveJobType === 'PRINT_AND_INSTALL' ? 'Print + Install' : effectiveJobType === 'INSTALL_ONLY' ? 'Install Only' : 'Print Only'}
Wrap Category: Commercial Print (Printed Graphics)`}
Vehicle: ${quote.vehicle_bucket}
Wrap Type: ${quote.wrap_type}

Material:
- Base Sqft: ${quote.base_sqft.toFixed(1)}
- Adjusted Sqft: ${quote.adjusted_sqft.toFixed(1)}
- Linear Feet: ${quote.linear_feet}
- Roll Width: ${quote.roll_width_inches}"
- Waste Percent: ${(quote.waste_percent * 100).toFixed(0)}%

Labor:
- Base Hours: ${quote.base_hours.toFixed(1)}
- Complexity Hours: ${quote.complexity_hours.toFixed(1)}
- Total Hours: ${quote.total_labor_hours.toFixed(1)}
- Rate: $${quote.labor_rate_per_hour || 0}/hr

Pricing:
- Material Cost: $${quote.material_cost.toFixed(2)}
- Labor Cost: $${quote.labor_cost.toFixed(2)}
- Design Fee: $${quote.design_fee_flat || 0}.00
- Overhead: $${quote.overhead_flat || 0}.00
- Subtotal: $${quote.subtotal_cost.toFixed(2)}
- Retail Price: $${quote.retail.toFixed(2)}
- Profit: $${quote.profit_dollars.toFixed(2)} (${(quote.profit_margin * 100).toFixed(1)}%)
${quote.deposit_amount ? `- Deposit: $${quote.deposit_amount.toFixed(2)}` : ''}

${quote.customer_name ? `Customer: ${quote.customer_name}` : ''}
${quote.customer_email ? `Email: ${quote.customer_email}` : ''}
${quote.notes ? `Notes: ${quote.notes}` : ''}

Created: ${new Date(quote.created_at).toLocaleString()}
`;

    const blob = new Blob([quoteText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wrapquote-${quote.id.slice(0, 8)}-${new Date(quote.created_at).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExporting(false);
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

  if (loading) {
    return (
      <>
        <Navigation currentPage="quotes" />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-body-sm text-gray-600">Loading quote...</p>
          </div>
        </div>
      </main>
      </>
    );
  }

  if (error || !quote) {
    return (
      <>
        <Navigation currentPage="quotes" />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <p className="text-body-base text-gray-900 mb-4">{error || 'Quote not found'}</p>
            <Link
              href="/quotes"
              className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors duration-300"
            >
              Back to Quotes
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-hero-heading text-gray-900">Quote Details</h1>
              <p className="text-body-base text-gray-600 mt-2">
                {quote.customer_name || 'Unnamed Quote'}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/quotes"
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all duration-300"
              >
                Back
              </Link>
              {canExportQuotes(subscriptionTier) && (
                <button
                  onClick={handleExportQuote}
                  disabled={exporting}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors duration-300"
                >
                  {exporting ? 'Exporting...' : 'Export'}
                </button>
              )}
            </div>
          </div>

        {/* Quote Summary Card */}
        <Card>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-section-heading text-gray-900 mb-2">
                ${quote.retail.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-body-sm text-gray-600">
                Created {new Date(quote.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-body-sm text-gray-600 rounded-full">
              {quote.wrap_category === 'COLOR_CHANGE' ? 'Color Change' : 'Commercial Print'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm">
            <div>
              <span className="text-gray-600">Vehicle:</span>
              <p className="font-semibold text-gray-900">{formatVehicleBucket(quote.vehicle_bucket)}</p>
            </div>
            <div>
              <span className="text-gray-600">Wrap Type:</span>
              <p className="font-semibold text-gray-900">{formatWrapType(quote.wrap_type)}</p>
            </div>
            <div>
              <span className="text-gray-600">Job Type:</span>
              <p className="font-semibold text-gray-900">
                {quote.wrap_category === 'COLOR_CHANGE' ? 'Install Only' : formatJobType(quote.job_type)}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Profit Margin:</span>
              <p className="font-semibold text-gray-900">{(quote.profit_margin * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        {/* Material Details */}
        <Card>
          <h3 className="text-card-heading text-gray-900 mb-4">Material</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm">
            <div>
              <span className="text-gray-600">Base Sqft:</span>
              <p className="font-semibold text-gray-900">{quote.base_sqft.toFixed(1)}</p>
            </div>
            <div>
              <span className="text-gray-600">Adjusted Sqft:</span>
              <p className="font-semibold text-gray-900">{quote.adjusted_sqft.toFixed(1)}</p>
            </div>
            <div>
              <span className="text-gray-600">Linear Feet:</span>
              <p className="font-semibold text-gray-900">{quote.linear_feet}</p>
            </div>
            <div>
              <span className="text-gray-600">Roll Width:</span>
              <p className="font-semibold text-gray-900">{quote.roll_width_inches}&quot;</p>
            </div>
          </div>
          {quote.vinyl_cost_per_lf && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-body-sm text-gray-600">
                Vinyl Cost: ${quote.vinyl_cost_per_lf.toFixed(2)}/linear foot
              </p>
              {quote.print_cost_per_sqft && (
                <p className="text-body-sm text-gray-600">
                  Print Cost: ${quote.print_cost_per_sqft.toFixed(2)}/sqft
                </p>
              )}
              {quote.lam_cost_per_sqft && (
                <p className="text-body-sm text-gray-600">
                  Laminate Cost: ${quote.lam_cost_per_sqft.toFixed(2)}/sqft
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Labor Details */}
        <Card>
          <h3 className="text-card-heading text-gray-900 mb-4">Labor</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm">
            <div>
              <span className="text-gray-600">Base Hours:</span>
              <p className="font-semibold text-gray-900">{quote.base_hours.toFixed(1)}</p>
            </div>
            <div>
              <span className="text-gray-600">Complexity Hours:</span>
              <p className="font-semibold text-gray-900">+{quote.complexity_hours.toFixed(1)}</p>
            </div>
            <div>
              <span className="text-gray-600">Total Hours:</span>
              <p className="font-semibold text-teal-600">{quote.total_labor_hours.toFixed(1)}</p>
            </div>
            <div>
              <span className="text-gray-600">Rate:</span>
              <p className="font-semibold text-gray-900">${quote.labor_rate_per_hour?.toFixed(2) || '0.00'}/hr</p>
            </div>
          </div>
        </Card>

        {/* Pricing Breakdown */}
        <Card>
          <h3 className="text-card-heading text-gray-900 mb-4">Pricing Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-body-sm">
              <span className="text-gray-600">Material Cost:</span>
              <span className="font-semibold text-gray-900">${quote.material_cost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body-sm">
              <span className="text-gray-600">Labor Cost:</span>
              <span className="font-semibold text-gray-900">${quote.labor_cost.toFixed(2)}</span>
            </div>
            {quote.design_fee_flat && (
              <div className="flex justify-between text-body-sm">
                <span className="text-gray-600">Design Fee:</span>
                <span className="font-semibold text-gray-900">${quote.design_fee_flat.toFixed(2)}</span>
              </div>
            )}
            {quote.overhead_flat && (
              <div className="flex justify-between text-body-sm">
                <span className="text-gray-600">Overhead:</span>
                <span className="font-semibold text-gray-900">${quote.overhead_flat.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between text-body-base mb-2">
                <span className="text-gray-900 font-semibold">Subtotal:</span>
                <span className="font-semibold text-gray-900">${quote.subtotal_cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-body-base mb-2">
                <span className="text-gray-900 font-semibold">Retail Price:</span>
                <span className="font-semibold text-teal-600 text-section-heading">${quote.retail.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span className="text-gray-600">Profit:</span>
                <span className="font-semibold text-gray-900">
                  ${quote.profit_dollars.toFixed(2)} ({(quote.profit_margin * 100).toFixed(1)}%)
                </span>
              </div>
              {quote.deposit_amount && (
                <div className="flex justify-between text-body-sm mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-semibold text-gray-900">${quote.deposit_amount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Customer Info & Notes */}
        {(quote.customer_name || quote.customer_email || quote.notes) && (
          <Card className="mb-0">
            <h3 className="text-card-heading text-gray-900 mb-4">Additional Information</h3>
            {quote.customer_name && (
              <div className="mb-3">
                <span className="text-body-sm text-gray-600">Customer Name:</span>
                <p className="text-body-base font-semibold text-gray-900">{quote.customer_name}</p>
              </div>
            )}
            {quote.customer_email && (
              <div className="mb-3">
                <span className="text-body-sm text-gray-600">Email:</span>
                <p className="text-body-base font-semibold text-gray-900">{quote.customer_email}</p>
              </div>
            )}
            {quote.notes && (
              <div>
                <span className="text-body-sm text-gray-600">Notes:</span>
                <p className="text-body-base text-gray-900 mt-1 whitespace-pre-wrap">{quote.notes}</p>
              </div>
            )}
          </Card>
        )}
        </div>
      </main>
    </>
  );
}

