'use strict';

import React from 'react';
import {
  Zap,
  Search,
  Smartphone,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Gauge,
  Target,
} from 'lucide-react';

export function OrbitalFeatureIcons() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
      {/* 1. Precision Targeting Reticle Rings (Archer Motif) */}
      <div className="absolute top-[230px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full border border-[rgba(255,255,255,0.05)] hidden sm:block">
        {/* Subtle crimson reticle markers */}
        <span className="absolute top-[18%] left-[8%] w-1.5 h-1.5 rounded-full bg-[#F20D4F] shadow-[0_0_8px_rgba(242,13,79,0.6)]" />
        <span className="absolute bottom-[22%] right-[10%] w-1.5 h-1.5 rounded-full bg-[#F20D4F]/80 shadow-[0_0_8px_rgba(242,13,79,0.5)]" />
      </div>

      <div className="absolute top-[230px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[820px] rounded-full border border-[rgba(255,255,255,0.03)] hidden md:block">
        <span className="absolute top-[38%] right-[4%] w-1.5 h-1.5 rounded-full bg-pink-400/60 shadow-[0_0_6px_rgba(242,13,79,0.4)]" />
        <span className="absolute bottom-[30%] left-[6%] w-1.5 h-1.5 rounded-full bg-emerald-400/40 shadow-[0_0_6px_rgba(16,185,129,0.3)]" />
      </div>

      <div className="absolute top-[230px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1080px] h-[1080px] rounded-full border border-[rgba(255,255,255,0.02)] hidden lg:block">
        <span className="absolute top-[12%] right-[22%] w-1.5 h-1.5 rounded-full bg-pink-500/30" />
        <span className="absolute bottom-[18%] left-[18%] w-1.5 h-1.5 rounded-full bg-[#F20D4F]/30" />
      </div>

      {/* 2. Left Side Feature Badges (Obsidian with crimson accents) */}

      {/* Left 1: Lighthouse Performance */}
      <div className="pointer-events-auto absolute top-[36px] left-4 lg:left-6 xl:left-8 flex flex-col items-center gap-1.5 animate-float-slow hidden lg:flex">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.09)] shadow-card flex items-center justify-center text-[#F20D4F] hover:border-[#F20D4F] hover:scale-105 hover:shadow-accent transition-all duration-300">
          <Gauge className="w-4 h-4 xl:w-5 xl:h-5 text-[#F20D4F]" />
        </div>
        <span className="hidden xl:inline text-[11px] font-medium text-[#B4B4BD] tracking-tight whitespace-nowrap bg-[#0B0B0D]/90 px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-card">
          Lighthouse Performance
        </span>
      </div>

      {/* Left 2: PageSpeed Insights */}
      <div className="pointer-events-auto absolute top-[145px] left-3 lg:left-5 xl:left-7 flex flex-col items-center gap-1.5 animate-float-delayed hidden lg:flex">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.09)] shadow-card flex items-center justify-center text-amber-400 hover:border-amber-400 hover:scale-105 transition-all duration-300">
          <Zap className="w-4 h-4 xl:w-5 xl:h-5 text-amber-400" />
        </div>
        <span className="hidden xl:inline text-[11px] font-medium text-[#B4B4BD] tracking-tight whitespace-nowrap bg-[#0B0B0D]/90 px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-card">
          PageSpeed Insights
        </span>
      </div>

      {/* Left 3: HTML & SEO Diagnostics */}
      <div className="pointer-events-auto absolute top-[255px] left-3 lg:left-5 xl:left-7 flex flex-col items-center gap-1.5 animate-float-slow hidden lg:flex">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.09)] shadow-card flex items-center justify-center text-emerald-400 hover:border-emerald-400 hover:scale-105 transition-all duration-300">
          <Search className="w-4 h-4 xl:w-5 xl:h-5 text-emerald-400" />
        </div>
        <span className="hidden xl:inline text-[11px] font-medium text-[#B4B4BD] tracking-tight whitespace-nowrap bg-[#0B0B0D]/90 px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-card">
          SEO &amp; DOM Audit
        </span>
      </div>

      {/* Left 4: Target Element Bounding Boxes */}
      <div className="pointer-events-auto absolute top-[365px] left-4 lg:left-6 xl:left-8 flex flex-col items-center gap-1.5 animate-float-delayed hidden lg:flex">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.09)] shadow-card flex items-center justify-center text-[#F20D4F] hover:border-[#F20D4F] hover:scale-105 transition-all duration-300">
          <Target className="w-4 h-4 xl:w-5 xl:h-5 text-[#F20D4F]" />
        </div>
        <span className="hidden xl:inline text-[11px] font-medium text-[#B4B4BD] tracking-tight whitespace-nowrap bg-[#0B0B0D]/90 px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-card">
          Precision Reticle
        </span>
      </div>

      {/* 3. Right Side Feature Badges */}

      {/* Right 1: AI Vision Prompts */}
      <div className="pointer-events-auto absolute top-[36px] right-4 lg:right-6 xl:right-8 flex flex-col items-center gap-1.5 animate-float-delayed hidden lg:flex">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.09)] shadow-card flex items-center justify-center text-[#F20D4F] hover:border-[#F20D4F] hover:scale-105 hover:shadow-accent transition-all duration-300">
          <Sparkles className="w-4 h-4 xl:w-5 xl:h-5 text-[#F20D4F]" />
        </div>
        <span className="hidden xl:inline text-[11px] font-medium text-[#B4B4BD] tracking-tight whitespace-nowrap bg-[#0B0B0D]/90 px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-card">
          AI Vision Prompts
        </span>
      </div>

      {/* Right 2: Assistant Dialogue */}
      <div className="pointer-events-auto absolute top-[145px] right-3 lg:right-5 xl:right-7 flex flex-col items-center gap-1.5 animate-float-slow hidden lg:flex">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.09)] shadow-card flex items-center justify-center text-pink-300 hover:border-[#F20D4F] hover:scale-105 transition-all duration-300">
          <MessageSquare className="w-4 h-4 xl:w-5 xl:h-5 text-pink-300" />
        </div>
        <span className="hidden xl:inline text-[11px] font-medium text-[#B4B4BD] tracking-tight whitespace-nowrap bg-[#0B0B0D]/90 px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-card">
          WebLens Assistant
        </span>
      </div>

      {/* Right 3: WCAG & Usability */}
      <div className="pointer-events-auto absolute top-[255px] right-3 lg:right-5 xl:right-7 flex flex-col items-center gap-1.5 animate-float-delayed hidden lg:flex">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.09)] shadow-card flex items-center justify-center text-emerald-400 hover:border-emerald-400 hover:scale-105 transition-all duration-300">
          <ShieldCheck className="w-4 h-4 xl:w-5 xl:h-5 text-emerald-400" />
        </div>
        <span className="hidden xl:inline text-[11px] font-medium text-[#B4B4BD] tracking-tight whitespace-nowrap bg-[#0B0B0D]/90 px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-card">
          WCAG 2.1 Accessibility
        </span>
      </div>

      {/* Right 4: Mobile Optimization */}
      <div className="pointer-events-auto absolute top-[365px] right-4 lg:right-6 xl:right-8 flex flex-col items-center gap-1.5 animate-float-slow hidden lg:flex">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.09)] shadow-card flex items-center justify-center text-[#F20D4F] hover:border-[#F20D4F] hover:scale-105 transition-all duration-300">
          <Smartphone className="w-4 h-4 xl:w-5 xl:h-5 text-[#F20D4F]" />
        </div>
        <span className="hidden xl:inline text-[11px] font-medium text-[#B4B4BD] tracking-tight whitespace-nowrap bg-[#0B0B0D]/90 px-2.5 py-0.5 rounded-full border border-[rgba(255,255,255,0.08)] shadow-card">
          Responsive Layouts
        </span>
      </div>
    </div>
  );
}
