'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  title: string;
  score: number | null | undefined;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ScoreGauge({
  title,
  score,
  subtitle,
  size = 'md',
  className,
}: ScoreGaugeProps) {
  const hasScore = typeof score === 'number' && !isNaN(score);

  const getScoreColor = (val: number) => {
    if (val >= 90) return { stroke: '#10b981', text: 'text-emerald-400' };
    if (val >= 50) return { stroke: '#f59e0b', text: 'text-amber-300' };
    return { stroke: '#F20D4F', text: 'text-[#F20D4F]' };
  };

  const colorConfig = hasScore ? getScoreColor(score!) : { stroke: '#777781', text: 'text-[#777781]' };

  // Gauge dimensions
  const dims = {
    sm: { size: 76, strokeWidth: 6, radius: 30, text: 'text-xl', label: 'text-xs' },
    md: { size: 104, strokeWidth: 8, radius: 42, text: 'text-2xl', label: 'text-sm' },
    lg: { size: 132, strokeWidth: 10, radius: 54, text: 'text-3xl', label: 'text-base' },
  }[size];

  const circumference = 2 * Math.PI * dims.radius;
  const strokeDashoffset = hasScore
    ? circumference - (score! / 100) * circumference
    : circumference;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between p-4 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] shadow-card transition-all hover:border-[rgba(255,255,255,0.15)] select-none',
        className
      )}
      role="region"
      aria-label={`${title} score: ${hasScore ? `${score} out of 100` : 'Not available'}`}
    >
      <div className="relative flex items-center justify-center my-1">
        <svg
          width={dims.size}
          height={dims.size}
          className="-rotate-90 transform"
          aria-hidden="true"
        >
          {/* Background Track */}
          <circle
            cx={dims.size / 2}
            cy={dims.size / 2}
            r={dims.radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={dims.strokeWidth}
            fill="transparent"
          />
          {/* Active Score Arc */}
          {hasScore && (
            <circle
              cx={dims.size / 2}
              cy={dims.size / 2}
              r={dims.radius}
              stroke={colorConfig.stroke}
              strokeWidth={dims.strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {hasScore ? (
            <span className={cn('font-black tracking-tight', dims.text, colorConfig.text)}>
              {score}
            </span>
          ) : (
            <span className="text-xs font-medium text-[#777781]">N/A</span>
          )}
        </div>
      </div>

      <div className="mt-2 text-center">
        <h4 className={cn('font-bold text-[#F7F7F8] leading-tight', dims.label)}>
          {title}
        </h4>
        {subtitle && (
          <p className="text-[11px] text-[#777781] mt-0.5 line-clamp-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
