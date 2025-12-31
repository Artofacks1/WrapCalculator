// import React from 'react';
import { cn } from '@/lib/utils';

interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  htmlFor?: string;
  className?: string;
}

/**
 * Standardized label component with consistent typography and spacing
 * Supports required indicator and disabled state
 */
export default function Label({
  children,
  required = false,
  disabled = false,
  htmlFor,
  className,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block text-body-sm font-small-heading mb-2',
        disabled ? 'text-gray-400' : 'text-gray-900',
        className
      )}
    >
      {children}
      {required && <span className="text-teal-600"> *</span>}
    </label>
  );
}

