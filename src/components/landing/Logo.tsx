// import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'light';
  showText?: boolean;
}

/**
 * WrapQuote Logo Component
 * Clean, modern logo with text that matches the design system
 */
export default function Logo({ className, variant = 'default', showText = true }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  
  return (
    <Link to="/" className={cn('inline-flex items-center gap-3 no-underline', className)}>
      {/* Logo Icon/Shape */}
      <div className="flex-shrink-0">
        <div className="relative">
          {/* Main square with gradient */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-600 to-blue-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl leading-none">W</span>
          </div>
          {/* Accent dot */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-teal-400 border-2 border-white"></div>
        </div>
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span className={cn('font-bold text-2xl tracking-tight', textColor)}>
          WrapQuote
        </span>
      )}
    </Link>
  );
}

