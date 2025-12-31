import { cn } from '@/lib/utils';
import Label from './Label';
import React, { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

/**
 * Standardized select dropdown component with consistent styling
 * Supports label, required indicator, and disabled state
 */
export default function Select({
  label,
  required = false,
  disabled = false,
  error,
  className,
  id,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;

  return (
    <div>
      {label && (
        <Label htmlFor={selectId} required={required} disabled={disabled}>
          {label}
        </Label>
      )}
      <select
        id={selectId}
        disabled={disabled}
        className={cn(
          'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors',
          error
            ? 'border-red-300'
            : disabled
            ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
            : 'border-gray-100',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-body-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

