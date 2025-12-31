'use client';

import { useState } from 'react';
// Removed unused supabase import
import type { SubscriptionTier } from '@/lib/types';
import { SUBSCRIPTION_FEATURES } from '@/lib/subscription';
import type { User } from '@supabase/supabase-js';

interface UpgradePromptProps {
  user: User | null;
  currentTier: SubscriptionTier;
  onUpgrade: () => void;
}

export default function UpgradePrompt({
  user,
  currentTier,
  onUpgrade,
}: UpgradePromptProps) {
  // onUpgrade prop is defined for API consistency but handled internally
  void onUpgrade;
  const [loading, setLoading] = useState(false);
  const [upgradeTier, setUpgradeTier] = useState<'PRO' | 'SHOP' | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const handleUpgrade = async (tier: 'PRO' | 'SHOP') => {
    if (!user) {
      alert('Please sign in to upgrade');
      return;
    }

    setLoading(true);
    setUpgradeTier(tier);
    try {
      const priceId = SUBSCRIPTION_FEATURES[tier].stripePriceId;
      if (!priceId) {
        alert('Price ID not configured');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      setUpgradeTier(null);
    }
  };

  if (currentTier === 'SHOP' || dismissed) {
    return null; // Already at highest tier or dismissed
  }

  const proFeatures = SUBSCRIPTION_FEATURES.PRO.features;
  const shopFeatures = SUBSCRIPTION_FEATURES.SHOP.features;

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-teal-50 via-blue-50 to-white shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,148,136,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Unlock Premium Features
            </h3>
            <p className="text-body-base text-gray-600">
              {currentTier === 'FREE' 
                ? 'Get more power with Pro or Shop plans'
                : 'Upgrade to Shop for the complete experience'}
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Pro Tier */}
          {currentTier === 'FREE' && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:border-teal-300 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-card-heading font-semibold text-gray-900 mb-1">Pro</h4>
                  <p className="text-body-sm text-gray-600">For professionals</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">${SUBSCRIPTION_FEATURES.PRO.price}</div>
                  <div className="text-xs text-gray-500">per month</div>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                {proFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-body-sm text-gray-700">
                    <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade('PRO')}
                disabled={loading && upgradeTier === 'PRO'}
                className="w-full px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                {loading && upgradeTier === 'PRO' ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Upgrade to Pro'
                )}
              </button>
            </div>
          )}

          {/* Shop Tier */}
          <div className={`bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-6 border-2 ${currentTier === 'PRO' ? 'border-teal-600' : 'border-blue-200'} hover:border-teal-600 transition-all duration-300 hover:shadow-md relative overflow-hidden`}>
            {currentTier === 'FREE' && (
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-600 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <div className={currentTier === 'FREE' ? 'mt-6' : ''}>
                <h4 className="text-card-heading font-semibold text-gray-900 mb-1">Shop</h4>
                <p className="text-body-sm text-gray-600">For shops & teams</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-700">${SUBSCRIPTION_FEATURES.SHOP.price}</div>
                <div className="text-xs text-gray-500">per month</div>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {(currentTier === 'FREE' ? shopFeatures : shopFeatures.slice(1)).map((feature, idx) => (
                <li key={idx} className="flex items-start text-body-sm text-gray-700">
                  <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade('SHOP')}
              disabled={loading && upgradeTier === 'SHOP'}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed ${
                currentTier === 'PRO' 
                  ? 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white' 
                  : 'bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 hover:border-teal-700'
              }`}
            >
              {loading && upgradeTier === 'SHOP' ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                currentTier === 'PRO' ? 'Upgrade to Shop' : 'Upgrade to Shop'
              )}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-body-sm text-gray-500">
          {!user && 'Sign in to upgrade your plan • '}
          All plans include a 14-day free trial
        </p>
      </div>
    </div>
  );
}

