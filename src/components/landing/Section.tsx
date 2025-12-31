// import React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

/**
 * Reusable section component with consistent spacing
 * Provides mobile-first responsive padding and max-width
 */
export default function Section({
  children,
  className,
  containerClassName,
}: SectionProps) {
  return (
    <section className={cn('py-12 md:py-16 lg:py-20', className)}>
      <div className={cn('max-w-6xl mx-auto px-4 sm:px-6 lg:px-8', containerClassName)}>
        {children}
      </div>
    </section>
  );
}

