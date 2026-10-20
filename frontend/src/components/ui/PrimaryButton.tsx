'use strict';

import React from 'react';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'crimson' | 'dark' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function PrimaryButton({
  children,
  variant = 'crimson',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const variantClass = {
    crimson: 'bg-[#F20D4F] hover:bg-[#FF245F] text-white shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] focus-visible:ring-[#F20D4F]',
    dark: 'bg-[#17171B] hover:bg-[#222228] text-white border border-[rgba(255,255,255,0.08)] focus-visible:ring-[#F20D4F]',
    blue: 'bg-[#F20D4F] hover:bg-[#FF245F] text-white shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] focus-visible:ring-[#F20D4F]',
  }[variant];

  const sizeClass = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 sm:px-5 text-xs sm:text-sm gap-2',
    lg: 'h-11 sm:h-12 px-6 text-sm font-semibold gap-2.5',
  }[size];

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed',
        variantClass,
        sizeClass,
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
