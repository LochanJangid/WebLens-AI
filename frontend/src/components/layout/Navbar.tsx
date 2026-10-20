'use strict';
/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  Menu,
  X,
  Bot,
  LayoutDashboard,
  Globe,
  Layers,
  HelpCircle,
  FileText,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAssistant } from '@/context/AssistantContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('hero');
  const { toggleAssistant, messages } = useAssistant();

  // API Health Check
  useEffect(() => {
    let mounted = true;
    api
      .getHealth()
      .then((res) => {
        if (mounted) setApiOnline(res.status === 'ok');
      })
      .catch(() => {
        if (mounted) setApiOnline(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Scroll detection for navbar styling transition, scroll progress & active section spy
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 20);

          // Update document scroll progress
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight > 0) {
            setScrollProgress(Math.min(100, Math.max(0, (scrollY / docHeight) * 100)));
          }

          if (pathname === '/') {
            const sections = [
              'hero',
              'features',
              'how-it-works',
              'capabilities',
              'example-report',
              'faq',
            ];

            const scrollPos = scrollY + 220;
            for (let i = sections.length - 1; i >= 0; i--) {
              const el = document.getElementById(sections[i]);
              if (el && el.offsetTop <= scrollPos) {
                setActiveSection(sections[i]);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Smooth scroll handler on landing page
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string,
    fallbackHref: string
  ) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(targetId);
        setMobileMenuOpen(false);
      }
    } else {
      router.push(fallbackHref);
      setMobileMenuOpen(false);
    }
  };

  // Focus hero URL input or navigate to audit form
  const handleGetStarted = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      const input = document.getElementById('landing-url-input');
      if (input) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        input.focus();
      }
      setMobileMenuOpen(false);
    } else {
      router.push('/audit');
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    {
      id: 'features',
      label: 'Features',
      targetId: 'features',
      fallbackHref: '/#features',
    },
    {
      id: 'how-it-works',
      label: 'How It Works',
      targetId: 'how-it-works',
      fallbackHref: '/#how-it-works',
    },
    {
      id: 'capabilities',
      label: 'Capabilities',
      targetId: 'capabilities',
      fallbackHref: '/#capabilities',
    },
    {
      id: 'example-report',
      label: 'Example Report',
      targetId: 'example-report',
      fallbackHref: '/#example-report',
    },
    {
      id: 'faq',
      label: 'FAQ',
      targetId: 'faq',
      fallbackHref: '/#faq',
    },
  ];

  return (
    <header className="fixed top-2 sm:top-3.5 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none select-none animate-navbar-entrance">
      <div
        className={cn(
          'relative max-w-6xl mx-auto pointer-events-auto rounded-2xl h-13 sm:h-14 px-3 sm:px-4.5 flex items-center justify-between transition-all duration-300 border backdrop-blur-md overflow-hidden',
          isScrolled
            ? 'bg-[#0B0B0D]/90 border-[rgba(242,13,79,0.25)] shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
            : 'bg-[#050505]/75 border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
        )}
      >
        {/* Subtle Crimson Scroll Progress Indicator */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#F20D4F]/40 via-[#F20D4F] to-[#FF245F] transition-all duration-150 ease-out pointer-events-none"
          style={{ width: `${scrollProgress}%` }}
        />
        {/* Brand Left Indicator */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, 'hero', '/')}
            className="flex items-center gap-2.5 text-[#F7F7F8] hover:opacity-90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F20D4F] rounded-lg"
          >
            <img
              src="/favicon.png"
              alt="WebLens AI Emblem"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-contain bg-[#0B0B0D] border border-[rgba(255,255,255,0.1)] p-0.5"
            />
            <span className="font-extrabold tracking-tight text-[#F7F7F8] text-sm">
              WebLens <span className="text-[#F20D4F]">AI</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1 pl-4 border-l border-[rgba(255,255,255,0.08)] text-xs">
            {navItems.map((item) => {
              const isActive = pathname === '/' && activeSection === item.targetId;
              return (
                <Link
                  key={item.id}
                  href={item.fallbackHref}
                  onClick={(e) => handleNavClick(e, item.targetId, item.fallbackHref)}
                  className={cn(
                    'px-2.5 py-1.5 rounded-xl font-medium transition-all text-[11px] xl:text-xs',
                    isActive
                      ? 'text-[#F7F7F8] bg-[#17171B] border border-[rgba(242,13,79,0.3)] shadow-[0_0_12px_rgba(242,13,79,0.15)] font-semibold'
                      : 'text-[#B4B4BD] hover:text-[#F7F7F8] hover:bg-[#111114]'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Direct Tool Links */}
            <Link
              href="/audit"
              className={cn(
                'ml-1 px-2.5 py-1.5 rounded-xl font-medium transition-all text-[11px] xl:text-xs flex items-center gap-1.5',
                pathname === '/audit'
                  ? 'text-[#F7F7F8] bg-[#17171B] border border-[#F20D4F] font-semibold'
                  : 'text-[#B4B4BD] hover:text-[#F7F7F8] hover:bg-[#111114]'
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#F20D4F]" />
              <span>Workspace</span>
            </Link>

            <Link
              href="/audit/inspect?mode=vision_hub"
              className={cn(
                'px-2.5 py-1.5 rounded-xl font-medium transition-all text-[11px] xl:text-xs flex items-center gap-1.5',
                pathname === '/audit/inspect'
                  ? 'text-[#F7F7F8] bg-[#17171B] border border-[#F20D4F] font-semibold'
                  : 'text-[#B4B4BD] hover:text-[#F7F7F8] hover:bg-[#111114]'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F20D4F]" />
              <span>Studio</span>
            </Link>
          </nav>
        </div>

        {/* Right Actions: Assistant & Primary CTA */}
        <div className="flex items-center gap-2.5">
          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={toggleAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs text-[#F7F7F8] bg-[#111114] hover:bg-[#17171B] border border-[rgba(242,13,79,0.3)] hover:border-[#F20D4F] transition shadow-card"
            title="Open WebLens AI Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-[#F20D4F]" />
            <span className="hidden sm:inline">Assistant</span>
            {messages.length > 1 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#F20D4F] text-white">
                {messages.length - 1}
              </span>
            )}
          </button>

          {/* Primary Action Button: Get Started */}
          <button
            type="button"
            onClick={handleGetStarted}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-white bg-[#F20D4F] hover:bg-[#FF245F] rounded-xl shadow-[0_0_16px_-3px_rgba(242,13,79,0.5)] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F20D4F]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 text-pink-200" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-xl text-[#B4B4BD] hover:text-[#F7F7F8] hover:bg-[#111114] transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden pointer-events-auto mt-2 max-w-6xl mx-auto rounded-2xl border border-[rgba(242,13,79,0.25)] bg-[#0B0B0D]/95 backdrop-blur-xl p-4 space-y-2 shadow-2xl animate-fade-in">
          <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-white/5">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.fallbackHref}
                onClick={(e) => handleNavClick(e, item.targetId, item.fallbackHref)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-[#B4B4BD] hover:text-[#F7F7F8] hover:bg-[#17171B] transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/audit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#F7F7F8] bg-[#111114] border border-white/10"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#F20D4F]" />
              <span>Workspace</span>
            </Link>

            <Link
              href="/audit/inspect?mode=vision_hub"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#F7F7F8] bg-[#111114] border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F20D4F]" />
              <span>AI Studio</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
