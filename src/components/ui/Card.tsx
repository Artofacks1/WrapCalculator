// import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

/**
 * Standardized card component using design system styling
 * Prevents card styling drift across the application
 */
export default function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6',
        hover && 'hover:shadow transition-shadow duration-300',
        className
      )}
    >
      {children}
    </div>
  );
}

