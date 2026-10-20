'use strict';
/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Zap,
  Check,
  Copy,
  Terminal,
  Lock,
  Target,
  ExternalLink,
} from 'lucide-react';

export function ProductPreviewIllustration() {
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const samplePrompt = `// WebLens AI · Target: https://sample-store.com (Sample Audit Data)
Objective: Fix WCAG color contrast and reduce Largest Contentful Paint (LCP)
Element 1: button.checkout-primary
- Current contrast ratio: 2.1:1 (Fails WCAG 2.1 AA)
- Action: Set background to #F20D4F, color: #FFFFFF, min-height: 48px
Element 2: img.hero-media
- Current size: 3.8 MB uncompressed JPEG
- Action: Convert to WebP format with next/image, priority loading, aspect-ratio: 16/9`;

  const handleCopy = () => {
    navigator.clipboard.writeText(samplePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div id="how-it-works" className="relative w-full max-w-5xl mx-auto pt-6 pb-2 select-none">
      {/* Soft Crimson Ambient Glow Behind Preview */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[360px] bg-gradient-to-r from-[rgba(242,13,79,0.18)] via-[rgba(242,13,79,0.08)] to-transparent blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />

      {/* Main Browser Window Frame */}
      <div className="rounded-2xl sm:rounded-3xl border border-[rgba(255,255,255,0.09)] bg-[#0B0B0D] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all">
        {/* Browser Top Window Bar */}
        <div className="px-4 py-3 bg-[#0E0E12] border-b border-[rgba(255,255,255,0.07)] flex items-center justify-between gap-4">
          {/* Window Controls */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F20D4F]/80 inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block shadow-xs" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block shadow-xs" />

            {/* Address Bar */}
            <div className="hidden sm:flex items-center gap-1.5 ml-3 px-3 py-1 rounded-md bg-[#17171B] border border-[rgba(255,255,255,0.08)] text-[11px] text-[#B4B4BD] font-mono shadow-xs">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>https://sample-store.com/</span>
              <span className="ml-2 text-[9px] uppercase px-1 py-0.2 rounded bg-[#111114] text-[#777781] border border-[rgba(255,255,255,0.06)]">
                Sample Preview
              </span>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[rgba(242,13,79,0.12)] text-[#F20D4F] border border-[rgba(242,13,79,0.3)] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F20D4F] animate-pulse" />
              <span>WebLens Precision Targeting</span>
            </span>
          </div>
        </div>

        {/* Browser Content Area: Sample Website + Visual Inspection Layer */}
        <div className="p-4 sm:p-8 bg-[#0B0B0D] relative">
          {/* Sample Audited Website Mock Interface */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111114] p-5 sm:p-7 shadow-card space-y-6">
            {/* Sample Website Header */}
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#F20D4F] flex items-center justify-center text-white text-xs font-black">
                  C
                </div>
                <span className="font-extrabold text-[#F7F7F8] text-xs sm:text-sm tracking-tight">
                  CraftedGoods
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-[#777781]">
                <span>Collections</span>
                <span>Our Story</span>
                <span>Sustainability</span>
              </div>
              <div className="text-xs font-semibold text-[#B4B4BD]">
                Cart (0)
              </div>
            </div>

            {/* Sample Website Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F20D4F]">
                  New Autumn Drop
                </span>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#F7F7F8] tracking-tight leading-snug">
                  Artisanal ceramic tableware handcrafted for everyday moments.
                </h3>

                <p className="text-xs sm:text-sm text-[#B4B4BD] leading-relaxed max-w-md">
                  Sustainable stoneware fired at high temperatures for timeless durability and minimalist warmth.
                </p>

                {/* Primary Action Button with ISSUE 1 HIGHLIGHTED */}
                <div className="pt-2 relative inline-block">
                  {/* Problem Bounding Box 1 (Crimson precision reticle) */}
                  <div className="relative rounded-xl border-2 border-[#F20D4F] bg-[rgba(242,13,79,0.12)] p-1.5 ring-4 ring-[#F20D4F]/20 shadow-accent inline-block">
                    {/* Reticle Badge Pin */}
                    <span className="absolute -top-3 -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#F20D4F] text-white font-bold text-xs shadow-card">
                      1
                    </span>

                    {/* Button under scrutiny */}
                    <button className="px-5 py-2.5 rounded-lg bg-[#222228] text-[#777781] text-xs font-medium cursor-not-allowed">
                      Click Here
                    </button>
                  </div>

                  {/* Floating Issue Tooltip Box */}
                  <div className="mt-2.5 max-w-xs rounded-xl border border-[rgba(242,13,79,0.35)] bg-[#17171B] p-2.5 text-xs text-[#F7F7F8] shadow-card space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#F20D4F]">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F20D4F]" />
                      <span>Issue #1: Contrast 2.1:1 &amp; Vague Label</span>
                    </div>
                    <p className="text-[11px] text-[#B4B4BD] leading-tight">
                      Fails WCAG 2.4.4; button text lacks required 4.5:1 contrast against dark background.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Hero Image with ISSUE 2 HIGHLIGHTED */}
              <div className="md:col-span-5 relative">
                {/* Problem Bounding Box 2 (Amber reticle) */}
                <div className="relative rounded-2xl border-2 border-amber-500 bg-amber-500/10 p-2 ring-4 ring-amber-400/20 shadow-card">
                  <span className="absolute -top-3 -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black font-bold text-xs shadow-card">
                    2
                  </span>

                  <div className="h-44 sm:h-52 rounded-xl bg-[#17171B] border border-[rgba(255,255,255,0.06)] flex flex-col items-center justify-center text-[#777781] p-4 text-center space-y-1.5">
                    <span className="font-mono text-xs text-[#F7F7F8] font-bold">
                      [hero-tableware.png]
                    </span>
                    <span className="text-[11px] text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                      Uncompressed 3.8 MB · Delays LCP by 2.8s
                    </span>
                    <span className="text-[10px] text-[#777781]">
                      Fails Core Web Vitals target of &lt; 2.5s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Agent Ready Prompt Snippet Box */}
            <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#F20D4F]" />
                  <span className="text-xs font-bold text-[#F7F7F8]">
                    WebLens AI Master Fix Prompt (Sample Data Preview)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#F20D4F] hover:text-[#FF245F] transition"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#F20D4F]" />
                      <span>Copy Prompt</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#050505] border border-[rgba(255,255,255,0.08)] font-mono text-[11px] text-[#B4B4BD] overflow-x-auto leading-relaxed">
                <pre className="whitespace-pre-wrap">{samplePrompt}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
