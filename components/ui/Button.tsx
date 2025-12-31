import { cn } from '@/lib/utils';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

/**
 * Standardized button component with consistent variants
 * Supports primary, secondary, and outline styles
 */
export default function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700 hover:shadow',
    secondary:
      'bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 hover:shadow',
    outline:
      'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

