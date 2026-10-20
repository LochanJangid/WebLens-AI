'use strict';

import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
}

export function PageContainer({
  children,
  className,
  maxWidth = '7xl',
  ...props
}: PageContainerProps) {
  const maxWidthClass = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }[maxWidth];

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8',
        maxWidthClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
