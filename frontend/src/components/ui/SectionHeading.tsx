'use strict';

import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'slate';
  align?: 'left' | 'center';
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  align = 'left',
  className,
  action,
}: SectionHeadingProps) {
  const badgeClasses = {
    blue: 'bg-blue-50 text-accent border-blue-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    slate: 'bg-slate-100 text-ink-secondary border-stroke',
  }[badgeColor];

  return (
    <div
      className={cn(
        'space-y-1.5',
        align === 'center' ? 'text-center max-w-2xl mx-auto' : '',
        action ? 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3' : '',
        className
      )}
    >
      <div className={align === 'center' ? 'flex flex-col items-center' : ''}>
        {badge && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border mb-1.5',
              badgeClasses
            )}
          >
            {badge}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-extrabold text-ink tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed pt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 pt-2 sm:pt-0">{action}</div>}
    </div>
  );
}
