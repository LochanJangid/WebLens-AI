'use strict';

import React from 'react';
import { cn } from '@/lib/utils';
import { MetricItem } from '@/types/api';

interface MetricCardProps {
  name: string;
  metric?: MetricItem | null;
  description?: string;
  className?: string;
}

export function MetricCard({ name, metric, description, className }: MetricCardProps) {
  if (!metric) {
    return (
      <div className={cn('p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] shadow-card', className)}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#777781]">{name}</span>
          <span className="text-[11px] text-[#777781]">N/A</span>
        </div>
        <div className="mt-2 text-sm font-semibold text-[#777781]">Not recorded</div>
      </div>
    );
  }

  const score = metric.score;
  let statusBadge = {
    label: 'Good',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    indicator: 'bg-emerald-400',
  };

  if (typeof score === 'number') {
    if (score < 0.5) {
      statusBadge = {
        label: 'Poor',
        bg: 'bg-[rgba(242,13,79,0.15)] text-[#F20D4F] border-[rgba(242,13,79,0.3)]',
        indicator: 'bg-[#F20D4F]',
      };
    } else if (score < 0.9) {
      statusBadge = {
        label: 'Needs work',
        bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        indicator: 'bg-amber-400',
      };
    }
  }

  const displayVal = metric.display_value || (metric.value !== null ? `${metric.value} ${metric.unit || ''}` : 'N/A');

  return (
    <div
      className={cn(
        'p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] shadow-card hover:border-[rgba(255,255,255,0.15)] transition-all duration-150',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#777781] tracking-wide uppercase">
          {name}
        </span>
        {typeof score === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border',
              statusBadge.bg
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', statusBadge.indicator)} />
            {statusBadge.label}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-black tracking-tight text-[#F7F7F8]">
          {displayVal}
        </span>
      </div>

      {description && (
        <p className="mt-1 text-[11px] text-[#777781] leading-snug">
          {description}
        </p>
      )}
    </div>
  );
}
