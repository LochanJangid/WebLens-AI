'use strict';
/* eslint-disable @next/next/no-img-element */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Terminal,
  Cpu,
  ArrowRight,
  Globe,
  Sparkles,
  Layers,
  HelpCircle,
  FileCode,
  LayoutDashboard,
} from 'lucide-react';
import { CreatorCredits } from './CreatorCredits';

export function Footer() {
  const pathname = usePathname();

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="relative border-t border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] text-[#B4B4BD] text-xs pt-16 pb-12 overflow-hidden select-none">
      {/* Subtle Crimson Radial Illumination */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[220px] bg-gradient-to-t from-[rgba(242,13,79,0.08)] to-transparent blur-[80px] pointer-events-none -z-10" />

      {/* Mountain Terrain Silhouette Backdrop Accent */}
      <div className="absolute bottom-0 inset-x-0 h-24 opacity-[0.05] pointer-events-none -z-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-white">
          <path d="M0,120 L150,70 L280,105 L420,40 L560,95 L720,25 L880,85 L1020,45 L1140,80 L1200,60 L1200,120 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info (2 columns) */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block hover:opacity-90 transition">
              <img
                src="/logo.png"
                alt="WebLens AI"
                className="h-8 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-[#777781] max-w-sm leading-relaxed">
              Production-grade website intelligence and screenshot-driven visual improvement studio. Precision auditing grounded in real Playwright DOM coordinates and Core Web Vitals.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#17171B] border border-[rgba(255,255,255,0.06)] text-[#F7F7F8]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>WCAG 2.1 AA</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#17171B] border border-[rgba(255,255,255,0.06)] text-[#F7F7F8]">
                <Terminal className="w-3.5 h-3.5 text-[#F20D4F]" />
                <span>AI Agent Prompts</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#17171B] border border-[rgba(255,255,255,0.06)] text-[#F7F7F8]">
                <Cpu className="w-3.5 h-3.5 text-pink-300" />
                <span>FastAPI + Groq</span>
              </span>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F7F7F8]">
              Product
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/#features"
                  onClick={(e) => handleScrollTo(e, 'features')}
                  className="hover:text-[#F20D4F] transition-colors"
                >
                  Features Overview
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  onClick={(e) => handleScrollTo(e, 'how-it-works')}
                  className="hover:text-[#F20D4F] transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/#capabilities"
                  onClick={(e) => handleScrollTo(e, 'capabilities')}
                  className="hover:text-[#F20D4F] transition-colors"
                >
                  Audit Capabilities
                </Link>
              </li>
              <li>
                <Link
                  href="/#example-report"
                  onClick={(e) => handleScrollTo(e, 'example-report')}
                  className="hover:text-[#F20D4F] transition-colors"
                >
                  Example Report
                </Link>
              </li>
              <li>
                <Link
                  href="/audit/inspect?mode=vision_hub"
                  className="hover:text-[#F20D4F] transition-colors flex items-center gap-1 text-[#F20D4F]"
                >
                  <span>AI Vision Studio</span>
                  <Sparkles className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Audit Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F7F7F8]">
              Workspace
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/audit" className="hover:text-[#F20D4F] transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-3 h-3 text-[#777781]" />
                  <span>Audit Workspace</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/audit?url=https%3A%2F%2Fstripe.com&strategy=desktop"
                  className="hover:text-[#F20D4F] transition-colors"
                >
                  Live Interactive Demo
                </Link>
              </li>
              <li>
                <Link
                  href="/audit/inspect?mode=vision_hub"
                  className="hover:text-[#F20D4F] transition-colors"
                >
                  Code Transformer
                </Link>
              </li>
              <li>
                <Link href="/audit" className="hover:text-[#F20D4F] transition-colors">
                  Local Audit History
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#F7F7F8]">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/#faq"
                  onClick={(e) => handleScrollTo(e, 'faq')}
                  className="hover:text-[#F20D4F] transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3 text-[#777781]" />
                  <span>Frequently Asked Questions</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://web.dev/explore/metrics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F20D4F] transition-colors flex items-center gap-1"
                >
                  <span>Core Web Vitals Spec</span>
                  <Globe className="w-3 h-3 text-[#777781]" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#F20D4F] transition-colors flex items-center gap-1"
                >
                  <span>W3C WCAG 2.1 Guidelines</span>
                  <Globe className="w-3 h-3 text-[#777781]" />
                </a>
              </li>
              <li>
                <span className="text-[#777781] block">
                  100% Free Forever &bull; Zero Paywalls
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Creator Credits & Portfolio Links */}
        <div className="pt-6 border-t border-[rgba(255,255,255,0.08)]">
          <CreatorCredits />
        </div>

        {/* Bottom Disclaimers */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-[#777781] text-[11px] gap-3">
          <p>
            &copy; {new Date().getFullYear()} WebLens AI &bull; Built by Lochan Jangid. WebLens diagnoses weaknesses and generates actionable AI prompts without modifying live websites without supervision.
          </p>
          <div className="flex items-center gap-4 shrink-0 font-medium text-[#B4B4BD]">
            <span>MIT License</span>
            <span>&bull;</span>
            <span>100% Open Access</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
