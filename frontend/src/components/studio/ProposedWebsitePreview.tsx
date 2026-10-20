'use strict';
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Layers,
  Globe,
  Check,
  Menu,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { CompleteRedesignModel } from '@/services/redesign';
import type { MeaningfulIssue } from '@/services/intelligence';

interface ProposedWebsitePreviewProps {
  redesign: CompleteRedesignModel;
  isMobile: boolean;
  showIssues: boolean;
  issues?: MeaningfulIssue[];
  onSelectIssue?: (issue: MeaningfulIssue) => void;
  selectedIssueId?: string | null;
}

export function ProposedWebsitePreview({
  redesign,
  isMobile,
  showIssues,
  issues = [],
  onSelectIssue,
  selectedIssueId,
}: ProposedWebsitePreviewProps) {
  const getIcon = (icon: CompleteRedesignModel['features'][0]['icon']) => {
    switch (icon) {
      case 'zap':
        return <Zap className="w-5 h-5 text-blue-600" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'layers':
        return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-teal-600" />;
      default:
        return <Check className="w-5 h-5 text-blue-600" />;
    }
  };

  const heroIssues = issues.filter((i) => i.pageSection === 'hero');
  const navIssues = issues.filter((i) => i.pageSection === 'header');
  const mediaIssues = issues.filter((i) => i.pageSection === 'media');
  const ctaIssues = issues.filter((i) => i.pageSection === 'cta');

  return (
    <div
      className={`bg-white text-slate-900 shadow-2xl transition-all duration-200 select-none ${
        isMobile ? 'max-w-[390px] mx-auto rounded-3xl overflow-hidden border-8 border-slate-800' : 'w-full'
      }`}
    >
      {/* Top Disclaimer Badge Banner */}
      <div className="bg-emerald-900 text-emerald-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800/80">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-emerald-200">
            Proposal Mockup
          </span>
          <span className="text-emerald-300/80 hidden sm:inline">— Complete Page Redesign</span>
        </div>
        <span className="text-[11px] text-emerald-300/70">
          Visual concept grounded in audit findings
        </span>
      </div>

      {/* 1. Header & Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-3.5 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              {redesign.brandName.charAt(0)}
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
              {redesign.brandName}
            </span>
          </div>

          {/* Desktop Nav Links */}
          {!isMobile && (
            <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
              {redesign.navLinks.map((link, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition"
                >
                  {link.text}
                </span>
              ))}
            </nav>
          )}

          {/* Action CTA & Mobile Menu Icon */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
            >
              {redesign.ctaButtonText}
            </button>

            {isMobile && (
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Issue Pins for Navigation (if showIssues is enabled) */}
        {showIssues && navIssues.length > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 z-30">
            {navIssues.slice(0, 2).map((issue, idx) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => onSelectIssue && onSelectIssue(issue)}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md transition-transform hover:scale-110 ${
                  selectedIssueId === issue.id ? 'bg-blue-600 ring-2 ring-white scale-110' : 'bg-red-500'
                }`}
                title={`Improved: ${issue.title}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-4 sm:px-8 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-slate-50/70 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Text Content */}
          <div className={`${redesign.hero.imageSrc ? 'lg:col-span-7' : 'lg:col-span-12 text-center'} space-y-5`}>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{redesign.hero.badgeText}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
              {redesign.hero.headline}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              {redesign.hero.subheadline}
            </p>

            <div className={`flex flex-wrap items-center gap-3 pt-2 ${redesign.hero.imageSrc ? '' : 'justify-center'}`}>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <span>{redesign.hero.primaryCta}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition"
              >
                {redesign.hero.secondaryCta}
              </button>
            </div>

            {/* Resolved Improvements Callout Tag */}
            {redesign.hero.resolvedIssues.length > 0 && (
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Resolved: LCP optimized with preloaded assets & semantic typography</span>
              </div>
            )}
          </div>

          {/* Hero Visual Graphic / Image */}
          {redesign.hero.imageSrc && (
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xl relative overflow-hidden group">
                <img
                  src={redesign.hero.imageSrc}
                  alt={redesign.hero.imageAlt}
                  className="w-full h-auto rounded-xl object-cover max-h-[340px]"
                />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-slate-900/85 backdrop-blur-md p-3 text-white text-xs space-y-0.5">
                  <div className="font-semibold text-[11px] text-blue-300 uppercase tracking-wider">
                    Optimized Media Asset
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    {redesign.hero.imageAlt}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Issue Pins for Hero (if showIssues is enabled) */}
        {showIssues && heroIssues.length > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 z-30">
            {heroIssues.slice(0, 3).map((issue, idx) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => onSelectIssue && onSelectIssue(issue)}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md transition-transform hover:scale-110 ${
                  selectedIssueId === issue.id ? 'bg-blue-600 ring-2 ring-white scale-110' : 'bg-red-500'
                }`}
                title={`Improved: ${issue.title}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 3. Features & Value Proposition Grid */}
      <section className="px-4 sm:px-8 py-12 sm:py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Key Capabilities
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Impact and Accessibility
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear visual hierarchy with generous spacing, WCAG AAA compliant text contrast, and focused readability.
            </p>
          </div>

          <div
            className={`grid gap-4 sm:gap-6 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {redesign.features.map((feat) => (
              <div
                key={feat.id}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {getIcon(feat.icon)}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Media & Visual Content Showcase */}
      {redesign.mediaShowcase.images.length > 0 && (
        <section className="px-4 sm:px-8 py-12 bg-slate-50/70 border-t border-slate-100 relative">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="max-w-xl space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Responsive Media
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900">
                {redesign.mediaShowcase.title}
              </h2>
              <p className="text-xs text-slate-500">
                {redesign.mediaShowcase.description}
              </p>
            </div>

            <div
              className={`grid gap-4 ${
                isMobile
                  ? 'grid-cols-1'
                  : redesign.mediaShowcase.images.length === 1
                  ? 'grid-cols-1 max-w-2xl'
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {redesign.mediaShowcase.images.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-2"
                >
                  {item.src ? (
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-40 object-cover rounded-lg bg-slate-100"
                    />
                  ) : (
                    <div className="w-full h-40 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                      Media Graphic
                    </div>
                  )}
                  <p className="text-[11px] text-slate-600 font-medium leading-snug">
                    {item.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Pins for Media (if showIssues is enabled) */}
          {showIssues && mediaIssues.length > 0 && (
            <div className="absolute top-4 right-4 flex items-center gap-1 z-30">
              {mediaIssues.slice(0, 2).map((issue, idx) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onSelectIssue && onSelectIssue(issue)}
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md transition-transform hover:scale-110 ${
                    selectedIssueId === issue.id ? 'bg-blue-600 ring-2 ring-white scale-110' : 'bg-red-500'
                  }`}
                  title={`Improved: ${issue.title}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. Call To Action Conversion Banner */}
      <section className="px-4 sm:px-8 py-12 sm:py-16 bg-slate-900 text-white relative">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            {redesign.ctaBanner.heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {redesign.ctaBanner.subheading}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition"
            >
              {redesign.ctaBanner.primaryButton}
            </button>
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              {redesign.ctaBanner.secondaryButton}
            </button>
          </div>
        </div>

        {/* Issue Pins for CTA (if showIssues is enabled) */}
        {showIssues && ctaIssues.length > 0 && (
          <div className="absolute top-4 right-4 flex items-center gap-1 z-30">
            {ctaIssues.slice(0, 2).map((issue, idx) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => onSelectIssue && onSelectIssue(issue)}
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md transition-transform hover:scale-110 ${
                  selectedIssueId === issue.id ? 'bg-blue-600 ring-2 ring-white scale-110' : 'bg-red-500'
                }`}
                title={`Improved: ${issue.title}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 6. Footer */}
      <footer className="bg-slate-950 text-slate-400 px-4 sm:px-8 py-10 border-t border-slate-800 text-xs space-y-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                {redesign.brandName.charAt(0)}
              </div>
              <span>{redesign.brandName}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {redesign.footer.brandText}
            </p>
            <p className="text-[11px] text-slate-500">
              {redesign.footer.accessibilityNote}
            </p>
          </div>

          <div className="md:col-span-6 grid grid-cols-2 gap-6">
            {redesign.footer.columns.map((col, idx) => (
              <div key={idx} className="space-y-2">
                <span className="font-semibold text-slate-200 text-xs uppercase tracking-wider block">
                  {col.title}
                </span>
                <ul className="space-y-1.5 text-xs">
                  {col.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <span className="hover:text-white cursor-pointer transition">
                        {link.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <span>{redesign.footer.copyright}</span>
          <span className="text-emerald-400 font-medium">
            Redesigned with WebLens AI
          </span>
        </div>
      </footer>
    </div>
  );
}
