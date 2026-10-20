'use strict';

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function SectionContainer({
  children,
  className,
  padding = 'md',
  ...props
}: SectionContainerProps) {
  const paddingClass = {
    none: 'p-0',
    sm: 'p-4 sm:p-5',
    md: 'p-5 sm:p-7',
    lg: 'p-6 sm:p-8 lg:p-10',
  }[padding];

  return (
    <div
      className={cn(
        'bg-surface rounded-section border border-stroke shadow-card transition-all',
        paddingClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
