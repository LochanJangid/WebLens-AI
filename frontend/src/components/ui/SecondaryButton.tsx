'use strict';

import React from 'react';
import { cn } from '@/lib/utils';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function SecondaryButton({
  children,
  size = 'md',
  className,
  disabled,
  ...props
}: SecondaryButtonProps) {
  const sizeClass = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-xs sm:text-sm gap-2',
    lg: 'h-11 sm:h-12 px-5 text-sm font-semibold gap-2.5',
  }[size];

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.08)] text-[#F7F7F8] font-semibold shadow-card hover:bg-[#17171B] hover:border-[rgba(255,255,255,0.15)] transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F20D4F] disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClass,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
