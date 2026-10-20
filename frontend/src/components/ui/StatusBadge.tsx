'use strict';

import React from 'react';
import { cn } from '@/lib/utils';

export type StatusBadgeVariant =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'good'
  | 'warning'
  | 'neutral'
  | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  label,
  variant = 'neutral',
  dot = true,
  className,
}: StatusBadgeProps) {
  const variantStyles: Record<StatusBadgeVariant, { badge: string; dot: string }> = {
    critical: {
      badge: 'bg-[rgba(242,13,79,0.15)] text-[#F20D4F] border border-[rgba(242,13,79,0.3)]',
      dot: 'bg-[#F20D4F]',
    },
    high: {
      badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
      dot: 'bg-orange-400',
    },
    medium: {
      badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
      dot: 'bg-amber-400',
    },
    low: {
      badge: 'bg-[#17171B] text-[#B4B4BD] border border-[rgba(255,255,255,0.08)]',
      dot: 'bg-[#777781]',
    },
    good: {
      badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
      dot: 'bg-emerald-400',
    },
    warning: {
      badge: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
      dot: 'bg-amber-400',
    },
    neutral: {
      badge: 'bg-[#111114] text-[#B4B4BD] border border-[rgba(255,255,255,0.08)]',
      dot: 'bg-[#777781]',
    },
    info: {
      badge: 'bg-[rgba(242,13,79,0.1)] text-[#F20D4F] border border-[rgba(242,13,79,0.25)]',
      dot: 'bg-[#F20D4F]',
    },
  };

  const current = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        current.badge,
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', current.dot)} />}
      <span>{label}</span>
    </span>
  );
}
