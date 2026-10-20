'use strict';
/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Shield, Gauge, Cpu, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLoadingStateProps {
  url: string;
  strategy: 'mobile' | 'desktop';
  includePagespeed: boolean;
}

export function AuditLoadingState({
  url,
  strategy,
  includePagespeed,
}: AuditLoadingStateProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      title: 'Validating URL & Fetching HTML',
      desc: 'Checking SSRF safety boundaries and retrieving page markup.',
      icon: Shield,
      isDone: secondsElapsed >= 2,
      isActive: secondsElapsed < 2,
    },
    {
      title: 'DOM & Structure Inspection',
      desc: 'Analyzing heading hierarchy, image alt text, links, and metadata.',
      icon: Globe,
      isDone: secondsElapsed >= 5,
      isActive: secondsElapsed >= 2 && secondsElapsed < 5,
    },
    ...(includePagespeed
      ? [
          {
            title: 'Google PageSpeed Insights & Core Web Vitals',
            desc: `Running simulated ${strategy} Chrome audit via PageSpeed API (FCP, LCP, CLS, TBT).`,
            icon: Gauge,
            isDone: secondsElapsed >= 14,
            isActive: secondsElapsed >= 5 && secondsElapsed < 14,
          },
        ]
      : []),
    {
      title: 'Translating Technical Findings & Classifying Issues',
      desc: 'Classifying verified defects, potential issues, and recommendations.',
      icon: Cpu,
      isDone: false,
      isActive: includePagespeed ? secondsElapsed >= 14 : secondsElapsed >= 5,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 select-none">
      <div className="bg-[#0B0B0D] rounded-3xl border border-[rgba(255,255,255,0.08)] shadow-card p-8 text-center">
        {/* Pulsing indicator with Favicon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#17171B] border border-[rgba(242,13,79,0.35)] flex items-center justify-center p-2.5 mb-6 shadow-accent relative">
          <div className="absolute inset-0 rounded-2xl bg-[#F20D4F]/20 animate-ping pointer-events-none" />
          <img
            src="/favicon.png"
            alt="WebLens AI"
            className="w-10 h-10 object-contain relative z-10 animate-pulse"
          />
        </div>

        <h3 className="text-xl font-bold text-[#F7F7F8] tracking-tight">
          Auditing Website in Real-Time
        </h3>
        <p className="mt-1 text-sm text-[#B4B4BD] max-w-md mx-auto">
          Inspecting <span className="font-semibold text-[#F7F7F8] break-all">{url}</span> for usability, performance, and structure.
        </p>

        {/* Live Elapsed Counter */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-[#111114] text-[#B4B4BD] text-xs font-mono border border-[rgba(255,255,255,0.08)]">
          <Clock className="w-3.5 h-3.5 text-[#777781]" />
          <span>Elapsed: {secondsElapsed}s</span>
          {includePagespeed && secondsElapsed > 15 && (
            <span className="text-[#777781]">• PageSpeed API usually takes ~15-25s</span>
          )}
        </div>

        {/* Step checklist */}
        <div className="mt-8 text-left border border-[rgba(255,255,255,0.08)] rounded-2xl bg-[#111114] p-5 space-y-4">
          {steps.map((step, idx) => {
            return (
              <div key={idx} className="flex items-start gap-3.5">
                <div className="mt-0.5">
                  {step.isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : step.isActive ? (
                    <div className="w-5 h-5 border-2 border-[#F20D4F] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[#17171B]" />
                  )}
                </div>
                <div>
                  <div
                    className={cn(
                      'text-sm font-semibold',
                      step.isActive
                        ? 'text-[#F20D4F]'
                        : step.isDone
                        ? 'text-[#F7F7F8]'
                        : 'text-[#777781]'
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-[#777781] mt-0.5">{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs text-[#777781]">
          The backend runs audits synchronously. Please keep this browser window open while the audit completes.
        </p>
      </div>
    </div>
  );
}
