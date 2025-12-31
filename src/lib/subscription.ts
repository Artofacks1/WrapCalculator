import type { SubscriptionTier } from './types';

export const SUBSCRIPTION_FEATURES: Record<
  SubscriptionTier,
  {
    name: string;
    price: number;
    features: string[];
    stripePriceId?: string;
  }
> = {
  FREE: {
    name: 'Free',
    price: 0,
    features: [
      'Calculator',
      '3 quotes max',
      'No AI confidence checks',
      'No saves or exports',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 29,
    features: [
      'Save presets',
      'Save quotes',
      'Unlimited confidence checks',
      'Export quotes',
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID as string,
  },
  SHOP: {
    name: 'Shop',
    price: 59,
    features: [
      'Everything in Pro',
      'Logo + shop info on exports',
      'Team messaging (no enforcement)',
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_SHOP_PRICE_ID as string,
  },
};

export function canSaveQuotes(tier: SubscriptionTier): boolean {
  return tier === 'PRO' || tier === 'SHOP';
}

export function canExportQuotes(tier: SubscriptionTier): boolean {
  return tier === 'PRO' || tier === 'SHOP';
}

export function canUseUnlimitedConfidence(tier: SubscriptionTier): boolean {
  return tier === 'PRO' || tier === 'SHOP';
}

export function canCustomizeExports(tier: SubscriptionTier): boolean {
  return tier === 'SHOP';
}

