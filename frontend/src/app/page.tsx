'use strict';

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Globe,
  ArrowRight,
  History,
  Sparkles,
  Loader2,
  Zap,
  ShieldCheck,
  Search,
  Bot,
  ChevronDown,
  ChevronUp,
  Target,
  FileCode,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUp,
  Cpu,
  HelpCircle,
} from 'lucide-react';
import { browserStorage, StoredAuditSummary } from '@/services/storage';
import { cn, isValidUrl } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Section reveal refs
  const featuresRef = useRef<HTMLElement>(null);
  const workflowRef = useRef<HTMLElement>(null);
  const capabilitiesRef = useRef<HTMLElement>(null);
  const reportRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [recentAudits, setRecentAudits] = useState<StoredAuditSummary[]>([]);

  // Parallax scroll state & reduced motion preference
  const [scrollY, setScrollY] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [featuresRevealed, setFeaturesRevealed] = useState(false);
  const [workflowRevealed, setWorkflowRevealed] = useState(false);
  const [capabilitiesRevealed, setCapabilitiesRevealed] = useState(false);
  const [reportRevealed, setReportRevealed] = useState(false);
  const [faqRevealed, setFaqRevealed] = useState(false);
  const [ctaRevealed, setCtaRevealed] = useState(false);

  // FAQ Accordion State (indices of open questions)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Example Report Preview Active Tab / Expanded Issue
  const [expandedIssueId, setExpandedIssueId] = useState<string>('issue-1');

  // Load recent audits from browser storage
  useEffect(() => {
    try {
      const audits = browserStorage.getRecentAudits();
      setRecentAudits(audits);
    } catch {
      // Storage unavailable fallback
    }
  }, []);

  // Scroll detection for parallax and IntersectionObserver for section reveals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMotionChange);

    // Throttled RAF scroll tracking for background movement
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Section reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === featuresRef.current) setFeaturesRevealed(true);
            if (entry.target === workflowRef.current) setWorkflowRevealed(true);
            if (entry.target === capabilitiesRef.current) setCapabilitiesRevealed(true);
            if (entry.target === reportRef.current) setReportRevealed(true);
            if (entry.target === faqRef.current) setFaqRevealed(true);
            if (entry.target === ctaRef.current) setCtaRevealed(true);
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (workflowRef.current) observer.observe(workflowRef.current);
    if (capabilitiesRef.current) observer.observe(capabilitiesRef.current);
    if (reportRef.current) observer.observe(reportRef.current);
    if (faqRef.current) observer.observe(faqRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Parallax translation for the background image layer
  const parallaxOffset = prefersReducedMotion ? 0 : Math.min(scrollY * 0.25, 260);

  // Handle outside click and Escape key to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Normalizes target URL (adds https:// if missing)
  const normalizeUrl = (raw: string): string => {
    let trimmed = raw.trim();
    if (!trimmed) return '';
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'https://' + trimmed;
    }
    return trimmed;
  };

  // Check if current input represents a valid website URL
  const isValidTarget = (val: string): boolean => {
    const candidate = normalizeUrl(val);
    return isValidUrl(candidate) && candidate.includes('.');
  };

  // Submit and route into real audit workflow
  const handleAnalyze = (targetUrl?: string) => {
    const rawToAnalyze = targetUrl || url;
    if (!rawToAnalyze.trim()) {
      inputRef.current?.focus();
      return;
    }

    const normalized = normalizeUrl(rawToAnalyze);
    if (!isValidUrl(normalized) || !normalized.includes('.')) {
      setUrlError('Please enter a valid website URL (e.g., stripe.com)');
      return;
    }

    setUrlError(null);
    setIsSubmitting(true);
    setIsFocused(false);

    // Connect to real audit workflow
    router.push(`/audit?url=${encodeURIComponent(normalized)}&strategy=desktop`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnalyze();
  };

  const scrollToHeroInput = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  };

  const isCurrentUrlValid = isValidTarget(url);

  // FAQ Content definitions
  const faqItems = [
    {
      q: 'What is WebLens AI?',
      a: 'WebLens AI is a production-grade website intelligence and screenshot-driven visual improvement studio built by Lochan Jangid. It combines Playwright DOM coordinate inspection, Google Lighthouse metrics, and Groq LLM synthesis to identify weaknesses in your website and craft high-precision AI prompts for Claude, GPT-4o, Cursor, and Antigravity.',
    },
    {
      q: 'Which website issues can it detect?',
      a: 'WebLens AI verifies performance bottlenecks (Largest Contentful Paint, Total Blocking Time, Cumulative Layout Shift), accessibility defects (WCAG 2.1 AA color contrast, missing image alt attributes, touch targets under 48px), SEO hierarchies (H1-H6 structures, meta tags, OpenGraph), and mobile layout responsiveness.',
    },
    {
      q: 'How does a website audit work?',
      a: 'When you submit a URL, WebLens launches a headless Playwright Chromium instance to render the live webpage, measures exact pixel coordinates for visual bounding boxes, captures high-resolution screenshots, extracts DOM metadata, and runs deterministic rule checks alongside Google Lighthouse diagnostics.',
    },
    {
      q: 'Are the recommendations generated by AI?',
      a: 'Yes. WebLens AI uses a dual-level architecture: deterministic Level 1 rules for instantaneous, zero-latency explanations, paired with Groq LLM intelligence to formulate ready-to-paste implementation prompts specifically calibrated for AI coding agents such as Cursor Composer, Windsurf, Claude Code, and Antigravity.',
    },
    {
      q: 'Can I audit my website more than once?',
      a: 'Yes, you can run audits as many times as you like. There are no limits, no rate caps, and no paywalls. Each run provides updated metrics so you can verify fixes as you implement them.',
    },
    {
      q: 'Where can I view my previous audits?',
      a: 'Every completed audit session is automatically preserved in your browser local storage for 7 days. You can revisit past audits, view historical Core Web Vitals, and review previous recommendations at any time through the History drawer in the Audit Workspace without re-running the crawler.',
    },
    {
      q: 'Is authentication required?',
      a: 'No authentication or account registration is required. WebLens AI is 100% free open access forever for all developers, designers, and creators with zero barriers to entry.',
    },
  ];

  return (
    <div className="w-full bg-[#050505] text-[#F7F7F8] selection:bg-[#F20D4F] selection:text-white">
      {/* =========================================================================
          SECTION 1: HERO SECTION
          Preserves the background image with parallax depth, centered input beneath artwork, and dropdown
      ========================================================================== */}
      <section
        id="hero"
        className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center px-4 overflow-hidden select-none bg-black"
      >
        {/* Parallax Background Artwork Layer */}
        <div
          className="absolute inset-0 pointer-events-none -z-0 animate-hero-bg transition-transform duration-75 ease-out"
          style={{
            backgroundImage: "url('/background.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: prefersReducedMotion ? 'none' : `translate3d(0, ${parallaxOffset}px, 0)`,
          }}
        />

        {/* Ambient Crimson Glow behind artwork */}
        <div className="absolute inset-0 bg-radial-gradient from-[rgba(242,13,79,0.18)] via-transparent to-transparent pointer-events-none -z-0 opacity-80 animate-pulse-glow" />

        {/* Subtle Atmospheric Grid */}
        <div className="absolute inset-0 bg-tech-grid opacity-20 pointer-events-none -z-0" />

        {/* Hero to Content Natural Transition Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-10" />

        {/* Centered URL Input Container: positioned beneath the visual center of background artwork */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[92vw] sm:max-w-lg md:max-w-xl translate-y-16 sm:translate-y-20 md:translate-y-24 z-30 animate-hero-input"
        >
          <form onSubmit={handleSubmit} className="relative w-full">
            <div
              className={cn(
                'relative flex items-center w-full rounded-2xl bg-black/70 backdrop-blur-md border transition-all duration-300 animate-hero-border',
                isFocused
                  ? 'border-[#F20D4F] ring-2 ring-[#F20D4F]/25 bg-black/90 shadow-[0_0_24px_rgba(242,13,79,0.25)]'
                  : urlError
                  ? 'border-rose-500/80 bg-black/80 shadow-[0_0_16px_rgba(244,63,94,0.25)]'
                  : 'border-[#F20D4F]/35 hover:border-[#F20D4F]/60 bg-black/70 shadow-[0_8px_32px_rgba(0,0,0,0.65)]'
              )}
            >
              <input
                id="landing-url-input"
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                onFocus={() => {
                  setIsFocused(true);
                  if (urlError) setUrlError(null);
                }}
                placeholder="Enter website URL to analyze..."
                className="w-full h-12 sm:h-14 pl-4 sm:pl-5 pr-28 sm:pr-32 bg-transparent text-[#F7F7F8] placeholder:text-[#777781] text-xs sm:text-sm font-medium focus:outline-none"
                autoComplete="off"
                spellCheck="false"
                disabled={isSubmitting}
              />

              {/* Compact Analyze Button: Visible when a valid URL is typed */}
              {isCurrentUrlValid && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 sm:right-2.5 h-8 sm:h-9 px-3.5 sm:px-4 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-[0_0_16px_-2px_rgba(242,13,79,0.5)] transition-all disabled:opacity-50 active:scale-95 animate-fade-in"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Analyze</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Inline Error Notification */}
            {urlError && (
              <div className="absolute -bottom-6 left-2 text-[11px] font-medium text-rose-400 animate-fade-in">
                {urlError}
              </div>
            )}
          </form>

          {/* Contextual Dropdown on Input Focus (Guaranteed not clipped by parent) */}
          {isFocused && !isSubmitting && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-[#0B0B0D]/95 backdrop-blur-xl border border-[rgba(242,13,79,0.3)] shadow-[0_16px_40px_rgba(0,0,0,0.85)] overflow-hidden z-40 p-2 space-y-1 divide-y divide-white/5 animate-fade-in">
              {/* Contextual Action 1: Analyze Website */}
              <div className="space-y-0.5">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAnalyze();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#17171B] transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#F20D4F]/15 border border-[#F20D4F]/30 text-[#F20D4F] flex items-center justify-center shrink-0">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#F7F7F8] truncate group-hover:text-white">
                        {url.trim() ? `Analyze ${url.trim()}` : 'Analyze Website'}
                      </div>
                      <div className="text-[11px] text-[#777781] leading-tight">
                        {url.trim()
                          ? 'Run complete DOM, performance, and visual intelligence audit'
                          : 'Enter any website URL to start instant audit'}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#17171B] border border-white/10 text-[#B4B4BD]">
                      ↵ Enter
                    </span>
                  </div>
                </button>
              </div>

              {/* Contextual Action 2: Recent Audits from Storage */}
              {recentAudits.length > 0 && (
                <div className="pt-1.5 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#777781] flex items-center gap-1.5">
                    <History className="w-3 h-3 text-[#F20D4F]" />
                    <span>Recent Audits</span>
                  </div>
                  {recentAudits.slice(0, 3).map((item) => (
                    <button
                      key={item.audit_id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAnalyze(item.url);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#17171B] transition-colors text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-medium text-[#F7F7F8] truncate">
                          {item.url}
                        </div>
                        <div className="text-[10px] text-[#777781] flex items-center gap-2">
                          <span>{item.finding_count} issues detected</span>
                          <span>&bull;</span>
                          <span className="capitalize">{item.strategy}</span>
                        </div>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-[#777781] shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Contextual Action 3: Example Report Loader */}
              <div className="pt-1.5 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#777781] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#F20D4F]" />
                  <span>Example Report</span>
                </div>
                {[
                  { name: 'Stripe', url: 'https://stripe.com' },
                  { name: 'GitHub', url: 'https://github.com' },
                ].map((ex) => (
                  <button
                    key={ex.url}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setUrl(ex.url);
                      handleAnalyze(ex.url);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#17171B] transition-colors text-left"
                  >
                    <span className="text-xs text-[#B4B4BD]">
                      {ex.name} — <span className="text-[#777781]">{ex.url}</span>
                    </span>
                    <span className="text-[10px] text-[#F20D4F] font-semibold">Load</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subtle Scroll Cue at bottom of Hero */}
        <div className="absolute bottom-6 inset-x-0 flex flex-col items-center justify-center pointer-events-none opacity-60 hover:opacity-100 transition-opacity z-20">
          <Link
            href="#features"
            className="pointer-events-auto flex flex-col items-center gap-1.5 text-[11px] text-[#B4B4BD] hover:text-[#F20D4F] transition-colors"
          >
            <span>Scroll to explore features</span>
            <ChevronDown className="w-4 h-4 text-[#F20D4F] animate-bounce" />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: FEATURES SECTION
          "Everything Your Website Needs to Improve."
          Staggered entrance reveal & hover lifts
      ========================================================================== */}
      <section
        id="features"
        ref={featuresRef}
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.06)] bg-[#050505] overflow-hidden"
      >
        {/* Restrained Crimson Atmospheric Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(242,13,79,0.12)_0%,transparent_70%)] pointer-events-none -z-0" />

        <div
          className={cn(
            'text-center space-y-3 max-w-3xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ease-out',
            featuresRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F20D4F]/10 border border-[#F20D4F]/25 text-[#F20D4F]">
            <Target className="w-3.5 h-3.5" />
            <span>Precision Diagnostic System</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F7F7F8]">
            Everything Your Website Needs to Improve.
          </h2>
          <p className="text-sm sm:text-base text-[#B4B4BD] leading-relaxed">
            Find technical issues, understand their impact, and prioritize the fixes that matter.
          </p>
        </div>

        {/* 4 Core Feature Cards with Staggered Entrance Sequence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card 1: Performance Audit */}
          <div
            className={cn(
              'p-6 sm:p-8 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] hover:border-[#F20D4F]/40 transition-all duration-500 shadow-card hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(242,13,79,0.12)] space-y-4 group',
              featuresRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
            style={{ transitionDelay: featuresRevealed ? '0ms' : '0ms' }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.08)] text-[#F20D4F] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#F20D4F]/10 group-hover:border-[#F20D4F]/30 transition-all duration-300">
              <Zap className="w-6 h-6 transition-transform duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#F7F7F8] group-hover:text-white transition-colors">
                1. Performance Audit
              </h3>
              <p className="text-xs sm:text-sm text-[#B4B4BD] leading-relaxed">
                Identify supported performance bottlenecks and loading issues. Pinpoint Largest Contentful Paint (LCP), Total Blocking Time (TBT), and Cumulative Layout Shift (CLS) directly affecting visitor conversion.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-[#777781]">
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Core Web Vitals</span>
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Lighthouse 11</span>
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Payload Sizing</span>
            </div>
          </div>

          {/* Card 2: Accessibility Audit */}
          <div
            className={cn(
              'p-6 sm:p-8 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] hover:border-[#F20D4F]/40 transition-all duration-500 shadow-card hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(242,13,79,0.12)] space-y-4 group',
              featuresRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
            style={{ transitionDelay: featuresRevealed ? '120ms' : '0ms' }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.08)] text-[#F20D4F] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#F20D4F]/10 group-hover:border-[#F20D4F]/30 transition-all duration-300">
              <ShieldCheck className="w-6 h-6 transition-transform duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#F7F7F8] group-hover:text-white transition-colors">
                2. Accessibility Audit
              </h3>
              <p className="text-xs sm:text-sm text-[#B4B4BD] leading-relaxed">
                Surface accessibility problems and opportunities for better usability. Automated verification of WCAG 2.1 AA color contrast, touch target sizes (≥48px), image alt attributes, and screen-reader hierarchy.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-[#777781]">
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">WCAG 2.1 AA</span>
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Touch Targets</span>
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Color Contrast</span>
            </div>
          </div>

          {/* Card 3: SEO Analysis */}
          <div
            className={cn(
              'p-6 sm:p-8 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] hover:border-[#F20D4F]/40 transition-all duration-500 shadow-card hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(242,13,79,0.12)] space-y-4 group',
              featuresRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
            style={{ transitionDelay: featuresRevealed ? '240ms' : '0ms' }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.08)] text-[#F20D4F] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#F20D4F]/10 group-hover:border-[#F20D4F]/30 transition-all duration-300">
              <Search className="w-6 h-6 transition-transform duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#F7F7F8] group-hover:text-white transition-colors">
                3. SEO Analysis
              </h3>
              <p className="text-xs sm:text-sm text-[#B4B4BD] leading-relaxed">
                Identify supported SEO issues affecting search visibility. Detect broken heading hierarchies, missing meta descriptions, canonical mismatches, missing viewport tags, and descriptive anchor text opportunities.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-[#777781]">
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">H1-H6 Hierarchy</span>
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Meta Tags</span>
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">OpenGraph</span>
            </div>
          </div>

          {/* Card 4: AI-Powered Recommendations */}
          <div
            className={cn(
              'p-6 sm:p-8 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] hover:border-[#F20D4F]/40 transition-all duration-500 shadow-card hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(242,13,79,0.12)] space-y-4 group',
              featuresRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
            style={{ transitionDelay: featuresRevealed ? '360ms' : '0ms' }}
          >
            <div className="w-12 h-12 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.08)] text-[#F20D4F] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#F20D4F]/10 group-hover:border-[#F20D4F]/30 transition-all duration-300">
              <Bot className="w-6 h-6 transition-transform duration-300" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#F7F7F8] group-hover:text-white transition-colors">
                4. AI-Powered Recommendations
              </h3>
              <p className="text-xs sm:text-sm text-[#B4B4BD] leading-relaxed">
                Explain findings and suggest improvements using the existing AI functionality. Generate ready-to-paste prompts calibrated for Antigravity CLI, Cursor Composer, Windsurf, and Claude Code.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-[#777781]">
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Groq LLM</span>
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Cursor Prompts</span>
              <span className="px-2 py-0.5 rounded-md bg-[#17171B] border border-white/5">Preserved Copy</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW IT WORKS SECTION
          Step 1: Enter Your Website
          Step 2: Run the Audit
          Step 3: Improve With Insights
          Animated progress line & sequential step entrance
      ========================================================================== */}
      <section
        id="how-it-works"
        ref={workflowRef}
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.06)] bg-[#050505] overflow-hidden"
      >
        <div
          className={cn(
            'text-center space-y-3 max-w-3xl mx-auto mb-16 sm:mb-20 transition-all duration-700 ease-out',
            workflowRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F20D4F]/10 border border-[#F20D4F]/25 text-[#F20D4F]">
            <Layers className="w-3.5 h-3.5" />
            <span>Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F7F7F8]">
            How WebLens AI Works
          </h2>
          <p className="text-sm sm:text-base text-[#B4B4BD] leading-relaxed">
            From single-click inspection to AI agent implementation in three grounded steps.
          </p>
        </div>

        {/* 3-Step Connected Workflow with Animated Progress Line */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-[rgba(255,255,255,0.08)] -translate-y-8 pointer-events-none -z-0 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#F20D4F] via-[#FF245F] to-[#F20D4F] transition-all duration-1000 ease-out"
              style={{
                width: workflowRevealed ? '100%' : '0%',
                transitionDelay: '300ms',
              }}
            />
          </div>

          {/* Step 1 */}
          <div
            className={cn(
              'p-6 sm:p-7 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] shadow-card space-y-4 relative z-10 transition-all duration-500 hover:border-[#F20D4F]/30 hover:-translate-y-1 group',
              workflowRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
            style={{ transitionDelay: workflowRevealed ? '100ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black font-mono text-[#F20D4F] group-hover:scale-105 transition-transform">01</span>
              <div className="w-9 h-9 rounded-xl bg-[#17171B] border border-white/5 text-[#F20D4F] flex items-center justify-center group-hover:border-[#F20D4F]/30 transition-colors">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#F7F7F8] group-hover:text-white transition-colors">
                Step 1: Enter Your Website
              </h3>
              <p className="text-xs text-[#B4B4BD] leading-relaxed">
                &ldquo;Provide the URL you want to analyze.&rdquo;
              </p>
              <p className="text-xs text-[#777781] leading-relaxed pt-1">
                Enter your live URL or staging address. WebLens accepts standard domains without complex setup or DNS verification.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={cn(
              'p-6 sm:p-7 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] shadow-card space-y-4 relative z-10 transition-all duration-500 hover:border-[#F20D4F]/30 hover:-translate-y-1 group',
              workflowRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
            style={{ transitionDelay: workflowRevealed ? '250ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black font-mono text-[#F20D4F] group-hover:scale-105 transition-transform">02</span>
              <div className="w-9 h-9 rounded-xl bg-[#17171B] border border-white/5 text-[#F20D4F] flex items-center justify-center group-hover:border-[#F20D4F]/30 transition-colors">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#F7F7F8] group-hover:text-white transition-colors">
                Step 2: Run the Audit
              </h3>
              <p className="text-xs text-[#B4B4BD] leading-relaxed">
                &ldquo;WebLens AI evaluates supported audit categories using the existing analysis pipeline.&rdquo;
              </p>
              <p className="text-xs text-[#777781] leading-relaxed pt-1">
                Headless Playwright Chromium measures element bounding boxes, captures crisp screenshots, and parses DOM metrics.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={cn(
              'p-6 sm:p-7 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] shadow-card space-y-4 relative z-10 transition-all duration-500 hover:border-[#F20D4F]/30 hover:-translate-y-1 group',
              workflowRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            )}
            style={{ transitionDelay: workflowRevealed ? '400ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black font-mono text-[#F20D4F] group-hover:scale-105 transition-transform">03</span>
              <div className="w-9 h-9 rounded-xl bg-[#17171B] border border-white/5 text-[#F20D4F] flex items-center justify-center group-hover:border-[#F20D4F]/30 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-[#F7F7F8] group-hover:text-white transition-colors">
                Step 3: Improve With Insights
              </h3>
              <p className="text-xs text-[#B4B4BD] leading-relaxed">
                &ldquo;Review findings, understand their impact, and follow actionable recommendations.&rdquo;
              </p>
              <p className="text-xs text-[#777781] leading-relaxed pt-1">
                Copy high-precision AI prompts into Cursor, Windsurf, or Antigravity, or use the Code Transformer to upgrade UI with preserved copy.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* =========================================================================
          SECTION 4: AUDIT CAPABILITIES SECTION
          Performance, Accessibility, SEO, Best Practices, Core Web Vitals
          Staggered entrance reveal & hover lifts
      ========================================================================== */}
      <section
        id="capabilities"
        ref={capabilitiesRef}
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.06)] bg-[#050505] overflow-hidden"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_top,rgba(242,13,79,0.08)_0%,transparent_70%)] pointer-events-none -z-0" />

        <div
          className={cn(
            'flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 transition-all duration-700 ease-out',
            capabilitiesRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F20D4F]/10 border border-[#F20D4F]/25 text-[#F20D4F]">
              <Activity className="w-3.5 h-3.5" />
              <span>Diagnostic Depth</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F7F7F8]">
              Supported Audit Capabilities
            </h2>
            <p className="text-sm sm:text-base text-[#B4B4BD] leading-relaxed">
              Every check is grounded in genuine browser automation, web standards, and verifiable technical evidence.
            </p>
          </div>

          <Link
            href="/audit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs font-semibold shadow-[0_0_16px_-3px_rgba(242,13,79,0.5)] transition self-start md:self-auto hover:-translate-y-0.5 active:scale-95"
          >
            <span>Launch Audit Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Capabilities Grid with Staggered Entrance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cap 1: Core Web Vitals */}
          <div
            className={cn(
              'p-6 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] space-y-3 transition-all duration-500 hover:border-[#F20D4F]/40 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(242,13,79,0.1)] group',
              capabilitiesRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{ transitionDelay: capabilitiesRevealed ? '50ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F7F7F8] group-hover:text-white transition-colors">Core Web Vitals</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17171B] text-emerald-400 border border-emerald-500/20">
                Performance
              </span>
            </div>
            <p className="text-xs text-[#B4B4BD] leading-relaxed">
              Measures real Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Total Blocking Time (TBT) using Google Lighthouse automation.
            </p>
            <ul className="text-[11px] text-[#777781] space-y-1 pt-1 font-mono">
              <li>&bull; LCP under 2.5s standard</li>
              <li>&bull; CLS under 0.1 layout shift</li>
              <li>&bull; TBT main thread blocking</li>
            </ul>
          </div>

          {/* Cap 2: Accessibility WCAG */}
          <div
            className={cn(
              'p-6 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] space-y-3 transition-all duration-500 hover:border-[#F20D4F]/40 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(242,13,79,0.1)] group',
              capabilitiesRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{ transitionDelay: capabilitiesRevealed ? '120ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F7F7F8] group-hover:text-white transition-colors">WCAG 2.1 AA Usability</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17171B] text-[#F20D4F] border border-[#F20D4F]/20">
                Accessibility
              </span>
            </div>
            <p className="text-xs text-[#B4B4BD] leading-relaxed">
              Automated color contrast ratio checking against WCAG AA 4.5:1 standards, minimum touch target heights (≥48px), and image alt text presence.
            </p>
            <ul className="text-[11px] text-[#777781] space-y-1 pt-1 font-mono">
              <li>&bull; Color contrast compliance</li>
              <li>&bull; Mobile touch targets</li>
              <li>&bull; Screen reader image tags</li>
            </ul>
          </div>

          {/* Cap 3: SEO Analysis */}
          <div
            className={cn(
              'p-6 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] space-y-3 transition-all duration-500 hover:border-[#F20D4F]/40 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(242,13,79,0.1)] group',
              capabilitiesRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{ transitionDelay: capabilitiesRevealed ? '190ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F7F7F8] group-hover:text-white transition-colors">Search Visibility</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17171B] text-blue-400 border border-blue-500/20">
                SEO
              </span>
            </div>
            <p className="text-xs text-[#B4B4BD] leading-relaxed">
              Parses H1-H6 heading hierarchy, title and meta description presence, canonical URLs, robots directives, and link anchor descriptions.
            </p>
            <ul className="text-[11px] text-[#777781] space-y-1 pt-1 font-mono">
              <li>&bull; Single H1 verification</li>
              <li>&bull; Meta description length</li>
              <li>&bull; Canonical link alignment</li>
            </ul>
          </div>

          {/* Cap 4: Playwright Visual Coordinates */}
          <div
            className={cn(
              'p-6 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] space-y-3 transition-all duration-500 hover:border-[#F20D4F]/40 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(242,13,79,0.1)] group',
              capabilitiesRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{ transitionDelay: capabilitiesRevealed ? '260ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F7F7F8] group-hover:text-white transition-colors">Visual Reticle Mapping</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17171B] text-amber-400 border border-amber-500/20">
                Coordinates
              </span>
            </div>
            <p className="text-xs text-[#B4B4BD] leading-relaxed">
              Calculates exact bounding box coordinates (x, y, width, height) on full-resolution viewport screenshots for pinpoint visual debugging.
            </p>
            <ul className="text-[11px] text-[#777781] space-y-1 pt-1 font-mono">
              <li>&bull; 1280x800 Desktop viewport</li>
              <li>&bull; 390x844 Mobile viewport</li>
              <li>&bull; Exact DOM node highlighting</li>
            </ul>
          </div>

          {/* Cap 5: AI Coding Agent Prompts */}
          <div
            className={cn(
              'p-6 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] space-y-3 transition-all duration-500 hover:border-[#F20D4F]/40 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(242,13,79,0.1)] group',
              capabilitiesRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{ transitionDelay: capabilitiesRevealed ? '330ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F7F7F8] group-hover:text-white transition-colors">AI Agent Synthesis</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17171B] text-purple-400 border border-purple-500/20">
                Groq LLM
              </span>
            </div>
            <p className="text-xs text-[#B4B4BD] leading-relaxed">
              Generates ready-to-paste implementation prompts with strict constraints, acceptance criteria, and file targeting for modern AI coding tools.
            </p>
            <ul className="text-[11px] text-[#777781] space-y-1 pt-1 font-mono">
              <li>&bull; Antigravity CLI packet</li>
              <li>&bull; Cursor Composer prompt</li>
              <li>&bull; Claude 3.7 Vision payload</li>
            </ul>
          </div>

          {/* Cap 6: Client Audit Storage */}
          <div
            className={cn(
              'p-6 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] space-y-3 transition-all duration-500 hover:border-[#F20D4F]/40 hover:-translate-y-1.5 hover:shadow-[0_12px_28px_rgba(242,13,79,0.1)] group',
              capabilitiesRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
            style={{ transitionDelay: capabilitiesRevealed ? '400ms' : '0ms' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#F7F7F8] group-hover:text-white transition-colors">Audit History &amp; Privacy</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#17171B] text-emerald-400 border border-emerald-500/20">
                Local-First
              </span>
            </div>
            <p className="text-xs text-[#B4B4BD] leading-relaxed">
              7-day client-side session retention stored safely in your browser. No external database syncing, zero cookies, and zero tracking.
            </p>
            <ul className="text-[11px] text-[#777781] space-y-1 pt-1 font-mono">
              <li>&bull; 100% Free forever</li>
              <li>&bull; Zero account required</li>
              <li>&bull; Instant session retrieval</li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: EXAMPLE REPORT PREVIEW SECTION
          Score cards, severity indicators, expandable issue summaries
          Perspective entrance & score glow
      ========================================================================== */}
      <section
        id="example-report"
        ref={reportRef}
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.06)] bg-[#050505] overflow-hidden"
      >
        <div
          className={cn(
            'text-center space-y-3 max-w-3xl mx-auto mb-16 transition-all duration-700 ease-out',
            reportRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F20D4F]/10 border border-[#F20D4F]/25 text-[#F20D4F]">
            <FileCode className="w-3.5 h-3.5" />
            <span>Interactive Sample</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F7F7F8]">
            Interactive Audit Report Preview
          </h2>
          <p className="text-sm sm:text-base text-[#B4B4BD] leading-relaxed">
            See how WebLens AI formats live diagnostics into clear, prioritized findings with actionable fixes.
          </p>
        </div>

        {/* Realistic Report Preview Container with Perspective Entrance */}
        <div
          className={cn(
            'rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] shadow-2xl p-6 sm:p-8 space-y-8 transition-all duration-700 ease-out',
            reportRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.98]'
          )}
        >
          {/* Header Row: Target URL & Score Cards */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[rgba(255,255,255,0.06)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F20D4F]">
                <Globe className="w-3.5 h-3.5" />
                <span>SAMPLE AUDIT REPORT &bull; REALISTIC DEMONSTRATION</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#F7F7F8]">
                https://stripe.com
              </h3>
              <p className="text-xs text-[#777781]">
                Scanned 42 DOM elements &bull; 4 Verified Actionable Opportunities Found
              </p>
            </div>

            {/* Score Badges with Subtle Scale/Pulse */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.06)] text-center hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl font-black font-mono text-emerald-400">94</div>
                <div className="text-[10px] uppercase font-bold text-[#777781] mt-0.5">
                  Performance
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.06)] text-center hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl font-black font-mono text-emerald-400">96</div>
                <div className="text-[10px] uppercase font-bold text-[#777781] mt-0.5">
                  Accessibility
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.06)] text-center hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl font-black font-mono text-emerald-400">100</div>
                <div className="text-[10px] uppercase font-bold text-[#777781] mt-0.5">
                  SEO
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.06)] text-center hover:border-emerald-500/40 transition-colors">
                <div className="text-2xl font-black font-mono text-emerald-400">92</div>
                <div className="text-[10px] uppercase font-bold text-[#777781] mt-0.5">
                  Best Practices
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Expandable Issues List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#777781]">
              Prioritized Findings (Click to inspect fix guide)
            </h4>

            {/* Issue 1 */}
            <div
              onClick={() => setExpandedIssueId(expandedIssueId === 'issue-1' ? '' : 'issue-1')}
              className={cn(
                'rounded-xl border p-4 transition-all cursor-pointer',
                expandedIssueId === 'issue-1'
                  ? 'border-[#F20D4F] bg-[#111114] shadow-[0_0_16px_rgba(242,13,79,0.15)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[#0E0E12] hover:border-white/10'
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-950/60 text-rose-300 border border-rose-500/30 shrink-0">
                    High Impact
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#F7F7F8] truncate">
                    Touch target size under 48px on mobile CTA button
                  </span>
                </div>
                {expandedIssueId === 'issue-1' ? (
                  <ChevronUp className="w-4 h-4 text-[#F20D4F] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#777781] shrink-0" />
                )}
              </div>

              {expandedIssueId === 'issue-1' && (
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] text-xs space-y-2 animate-fade-in">
                  <div className="text-[#B4B4BD]">
                    <span className="font-semibold text-white">What is happening:</span> The target element &lt;a class=&quot;btn-nav&quot;&gt; measures 34px &times; 32px, falling below the WCAG 2.5.5 minimum touch size of 48px &times; 48px on mobile screens.
                  </div>
                  <div className="p-3 rounded-lg bg-[#050505] font-mono text-[11px] text-emerald-300 border border-white/5">
                    Recommended Fix: Add min-h-[48px] px-4 py-3 rounded-xl to ensure comfortable finger tap radius.
                  </div>
                </div>
              )}
            </div>

            {/* Issue 2 */}
            <div
              onClick={() => setExpandedIssueId(expandedIssueId === 'issue-2' ? '' : 'issue-2')}
              className={cn(
                'rounded-xl border p-4 transition-all cursor-pointer',
                expandedIssueId === 'issue-2'
                  ? 'border-[#F20D4F] bg-[#111114] shadow-[0_0_16px_rgba(242,13,79,0.15)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[#0E0E12] hover:border-white/10'
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950/60 text-amber-300 border border-amber-500/30 shrink-0">
                    Medium
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#F7F7F8] truncate">
                    Largest Contentful Paint image not preloaded
                  </span>
                </div>
                {expandedIssueId === 'issue-2' ? (
                  <ChevronUp className="w-4 h-4 text-[#F20D4F] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#777781] shrink-0" />
                )}
              </div>

              {expandedIssueId === 'issue-2' && (
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] text-xs space-y-2 animate-fade-in">
                  <div className="text-[#B4B4BD]">
                    <span className="font-semibold text-white">What is happening:</span> The hero background artwork accounts for 68% of LCP latency because it relies on standard lazy loading instead of high-priority preloading.
                  </div>
                  <div className="p-3 rounded-lg bg-[#050505] font-mono text-[11px] text-emerald-300 border border-white/5">
                    Recommended Fix: Add &lt;link rel=&quot;preload&quot; as=&quot;image&quot; fetchpriority=&quot;high&quot; href=&quot;...&quot; /&gt; inside the head tag.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Report Footer Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.06)] text-xs">
            <span className="text-[#777781]">
              Sample report generated from real Playwright DOM capture &amp; Lighthouse data.
            </span>
            <Link
              href="/audit?url=https%3A%2F%2Fstripe.com&strategy=desktop"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#17171B] hover:bg-[#222228] text-[#F7F7F8] border border-[rgba(255,255,255,0.1)] transition font-semibold hover:-translate-y-0.5"
            >
              <span>View Full Interactive Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F20D4F]" />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: FAQ ACCORDION SECTION
          Answers reflecting real implementation (no accounts, free forever, etc.)
          Smooth accordion transitions
      ========================================================================== */}
      <section
        id="faq"
        ref={faqRef}
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-[rgba(255,255,255,0.06)] bg-[#050505]"
      >
        <div
          className={cn(
            'text-center space-y-3 mb-16 transition-all duration-700 ease-out',
            faqRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#F20D4F]/10 border border-[#F20D4F]/25 text-[#F20D4F]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Questions &amp; Answers</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#F7F7F8]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-[#B4B4BD] leading-relaxed">
            Everything you need to know about WebLens AI auditing and architecture.
          </p>
        </div>

        {/* Accordion Container */}
        <div
          className={cn(
            'space-y-3 transition-all duration-700 ease-out',
            faqRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          )}
        >
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className={cn(
                  'rounded-2xl border transition-all overflow-hidden',
                  isOpen
                    ? 'border-[#F20D4F]/40 bg-[#0B0B0D] shadow-[0_4px_24px_rgba(242,13,79,0.1)]'
                    : 'border-[rgba(255,255,255,0.06)] bg-[#09090B] hover:border-white/10'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[#F7F7F8] pr-4">
                    {item.q}
                  </span>
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200',
                      isOpen ? 'bg-[#F20D4F] text-white rotate-180' : 'bg-[#17171B] text-[#777781]'
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#B4B4BD] leading-relaxed border-t border-[rgba(255,255,255,0.04)] pt-4 animate-fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FINAL CALL TO ACTION SECTION
          Scrolls to and focuses the URL input at the top!
          Crimson ambient aura & smooth reveal
      ========================================================================== */}
      <section
        ref={ctaRef}
        className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[rgba(255,255,255,0.06)]"
      >
        <div
          className={cn(
            'relative rounded-3xl border border-[rgba(242,13,79,0.3)] bg-[#0B0B0D] p-8 sm:p-14 text-center overflow-hidden shadow-2xl space-y-6 transition-all duration-700 ease-out',
            ctaRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-[0.98]'
          )}
        >
          {/* Subtle Ambient Crimson Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-[rgba(242,13,79,0.18)] via-transparent to-transparent pointer-events-none -z-0 animate-pulse-glow" />

          {/* Mountain Silhouette Accent */}
          <div className="absolute bottom-0 inset-x-0 h-16 opacity-[0.06] pointer-events-none -z-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full fill-white">
              <path d="M0,120 L150,70 L280,105 L420,40 L560,95 L720,25 L880,85 L1020,45 L1140,80 L1200,60 L1200,120 Z" />
            </svg>
          </div>

          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#F7F7F8] leading-tight">
              Ready to See What Your Website Is Missing?
            </h2>
            <p className="text-sm sm:text-base text-[#B4B4BD] leading-relaxed">
              Run an audit and discover opportunities to improve your website.
            </p>
          </div>

          <div className="relative z-10 pt-2">
            <button
              type="button"
              onClick={scrollToHeroInput}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-sm font-bold shadow-[0_0_24px_rgba(242,13,79,0.5)] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F20D4F] hover:-translate-y-0.5"
            >
              <span>Analyze Your Website</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 pt-4 text-[11px] text-[#777781] flex items-center justify-center gap-4">
            <span>&bull; 100% Free Forever</span>
            <span>&bull; No Account Required</span>
            <span>&bull; Instant Analysis</span>
          </div>
        </div>
      </section>
    </div>
  );
}
