'use client';

import React from 'react';
import { ExternalLink, Github, Linkedin, Globe, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreatorCreditsProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function CreatorCredits({ className, variant = 'compact' }: CreatorCreditsProps) {
  const links = [
    {
      name: 'Portfolio',
      href: 'https://lochan.vercel.app/',
      icon: Globe,
      label: 'View Lochan Jangid Portfolio',
    },
    {
      name: 'GitHub',
      href: 'https://github.com/LochanJangid',
      icon: Github,
      label: 'Visit GitHub profile',
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/lochan-jangid/',
      icon: Linkedin,
      label: 'Connect on LinkedIn',
    },
  ];

  if (variant === 'full') {
    return (
      <section
        className={cn(
          'max-w-4xl mx-auto px-4 sm:px-6 py-8 border-t border-[rgba(255,255,255,0.08)] text-center space-y-4',
          className
        )}
        aria-label="About WebLens and Creator"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(242,13,79,0.12)] text-[#F20D4F] border border-[rgba(242,13,79,0.3)] text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#F20D4F]" />
          <span>About WebLens AI</span>
        </div>

        <p className="text-xs sm:text-sm text-[#B4B4BD] max-w-xl mx-auto leading-relaxed">
          WebLens AI helps website owners and engineers see weaknesses others overlook and target precise improvements—translating technical diagnostics into concrete, actionable steps, screenshot-based visual overhauls, and ready-to-run coding agent prompts.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#B4B4BD]">
          <span className="font-semibold text-[#F7F7F8]">
            Built by Lochan Jangid · <span className="font-normal text-[#777781]">AI/ML Engineer</span>
          </span>

          <span className="hidden sm:inline text-[#777781]">•</span>

          <div className="flex items-center gap-4">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="inline-flex items-center gap-1.5 font-medium text-[#B4B4BD] hover:text-[#F20D4F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F20D4F] rounded-lg"
                >
                  <Icon className="w-3.5 h-3.5 text-[#F20D4F]" />
                  <span>{link.name}</span>
                  <ExternalLink className="w-3 h-3 text-[#777781]" />
                </a>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Compact variant for standard footer
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#B4B4BD] pt-4 border-t border-[rgba(255,255,255,0.08)]',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-normal text-[#B4B4BD]">
          Built by <span className="font-semibold text-[#F7F7F8]">Lochan Jangid</span>
        </span>
        <span className="text-[#777781]">•</span>
        <span className="text-[#777781]">AI/ML Engineer</span>
      </div>

      <div className="flex items-center gap-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="inline-flex items-center gap-1 text-[#B4B4BD] hover:text-[#F20D4F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F20D4F] rounded-lg"
            >
              <Icon className="w-3.5 h-3.5 text-[#F20D4F]" />
              <span>{link.name}</span>
              <ExternalLink className="w-2.5 h-2.5 text-[#777781]" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
