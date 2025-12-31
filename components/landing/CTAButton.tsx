import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';

interface CTAButtonProps {
  href: string;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  className?: string;
}

/**
 * Consistent CTA button component for landing pages
 * Ensures all CTAs follow the same style and behavior
 */
export default function CTAButton({
  href,
  variant = 'primary',
  children,
  className,
}: CTAButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-base transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700 hover:shadow-md',
    secondary:
      'bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 hover:shadow-md',
  };

  return (
    <Link href={href} className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </Link>
  );
}

