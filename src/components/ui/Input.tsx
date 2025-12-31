import { cn } from '@/lib/utils';
import Label from './Label';
import React, { useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

/**
 * Standardized input component with error/disabled states
 * Handles label rendering and consistent styling
 */
export default function Input({
  label,
  required = false,
  error,
  disabled = false,
  className,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;

  return (
    <div>
      {label && (
        <Label htmlFor={inputId} required={required} disabled={disabled}>
          {label}
        </Label>
      )}
      <input
        id={inputId}
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
      />
      {error && <p className="text-body-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

