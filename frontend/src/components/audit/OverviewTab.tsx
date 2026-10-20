'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileCode,
  Gauge,
  HelpCircle,
  Layers,
  Sparkles,
  Zap,
  Eye,
} from 'lucide-react';
import { AuditResponse } from '@/types/api';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { MetricCard } from '@/components/ui/MetricCard';
import { formatBytes } from '@/lib/utils';

interface OverviewTabProps {
  audit: AuditResponse;
  onSelectTab: (tabId: string) => void;
}

export function OverviewTab({ audit, onSelectTab }: OverviewTabProps) {
  const { page_snapshot, pagespeed } = audit;
  const findings = audit?.findings || [];
  const scores = pagespeed?.scores || {};
  const metrics = pagespeed?.metrics || {};

  // Safe element arrays
  const imagesList = page_snapshot?.images || [];
  const linksList = page_snapshot?.links || [];
  const buttonsList = page_snapshot?.buttons || [];
  const h1List = page_snapshot?.headings?.h1 || [];

  // Group findings count by severity
  const severityCounts = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<string, number>
  );

  // Group findings count by classification
  const classificationCounts = findings.reduce(
    (acc, f) => {
      acc[f.classification] = (acc[f.classification] || 0) + 1;
      return acc;
    },
    { verified_defect: 0, potential_issue: 0, recommendation: 0, needs_review: 0 } as Record<string, number>
  );

  return (
    <div className="space-y-8">
      {/* Top Banner / URL Metadata */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Audited URL
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-700 capitalize">
              {audit.strategy || 'mobile'} Strategy
            </span>
            {pagespeed && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200">
                Lighthouse v{pagespeed.lighthouse_version || '11'}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <a
              href={audit.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base sm:text-lg font-bold text-slate-900 hover:text-brand-600 transition-colors flex items-center gap-1.5 break-all"
            >
              <span>{audit.url}</span>
              <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
            </a>
          </div>
          {pagespeed?.final_url && pagespeed.final_url !== audit.url && (
            <p className="text-xs text-slate-500 mt-0.5">
              Redirected to: <span className="font-mono">{pagespeed.final_url}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => onSelectTab('problems')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span>Review {findings.length} Issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onSelectTab('elements')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Exact Element Fixes</span>
          </button>
        </div>
      </div>

      {/* Visual Audit Callout Banner */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Interactive Visual Screenshots Available
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Inspect your audited website with numbered bounding boxes, DOM coordinates, and before/after comparison mockups.
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('visual')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition shadow-xs"
        >
          <span>Open Visual Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Core Questions Card */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            The 5 Questions WebLens Answers For You
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">
              01 • WHAT IS WRONG?
            </span>
            <p className="text-slate-300 font-medium">
              Translates technical Lighthouse diagnostics into plain, business-friendly English.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">
              02 • WHERE IS IT?
            </span>
            <p className="text-slate-300 font-medium">
              Pinpoints the exact DOM element, CSS selector, tag, or missing section.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">
              03 • WHY IT MATTERS?
            </span>
            <p className="text-slate-300 font-medium">
              Explains the real impact on conversions, SEO ranking, visitor bounce rate, or accessibility.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">
              04 • WHAT TO CHANGE?
            </span>
            <p className="text-slate-300 font-medium">
              Provides concrete suggested replacement text, layout improvements, and step-by-step guidance.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="font-mono text-[10px] text-blue-400 font-bold block mb-1">
              05 • AI CODING PROMPT
            </span>
            <p className="text-slate-300 font-medium">
              Generates ready-to-paste prompts tailored for AI agents like Antigravity, Cursor, and Claude.
            </p>
          </div>
        </div>
      </div>

      {/* Lighthouse Scores Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Lighthouse Category Scores
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard 0–100 Google Lighthouse audit scores. Scores above 90 are considered good.
            </p>
          </div>
          {!pagespeed && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
              PageSpeed disabled for this run
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <ScoreGauge
            title="Performance"
            score={scores.performance?.score}
            subtitle="Speed & responsiveness"
          />
          <ScoreGauge
            title="Accessibility"
            score={scores.accessibility?.score}
            subtitle="Inclusive user experience"
          />
          <ScoreGauge
            title="Best Practices"
            score={scores['best-practices']?.score}
            subtitle="Web standards & security"
          />
          <ScoreGauge
            title="SEO"
            score={scores.seo?.score}
            subtitle="Search engine visibility"
          />
        </div>
      </div>

      {/* Core Web Vitals Metrics */}
      {pagespeed && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Core Web Vitals & Diagnostic Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Measurable user experience metrics captured during page rendering.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard
              name="LCP (Largest Paint)"
              metric={metrics.LCP}
              description="Main content loaded"
            />
            <MetricCard
              name="FCP (First Paint)"
              metric={metrics.FCP}
              description="First visual feedback"
            />
            <MetricCard
              name="CLS (Layout Shift)"
              metric={metrics.CLS}
              description="Visual stability score"
            />
            <MetricCard
              name="TBT (Blocking Time)"
              metric={metrics.TBT}
              description="Main thread interactivity lag"
            />
            <MetricCard
              name="Speed Index"
              metric={metrics['Speed Index']}
              description="Visual page fill speed"
            />
          </div>
        </div>
      )}

      {/* Findings Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span>Findings by Priority</span>
            <span className="text-xs font-normal text-slate-500">
              Total: {findings.length}
            </span>
          </h4>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-rose-50/60 border border-rose-100">
              <span className="font-semibold text-rose-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Critical & High Severity
              </span>
              <span className="font-bold text-rose-900">
                {(severityCounts.critical || 0) + (severityCounts.high || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-amber-50/60 border border-amber-100">
              <span className="font-semibold text-amber-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Medium Severity
              </span>
              <span className="font-bold text-amber-900">
                {severityCounts.medium || 0}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-blue-50/60 border border-blue-100">
              <span className="font-semibold text-blue-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Low Severity & Info
              </span>
              <span className="font-bold text-blue-900">
                {(severityCounts.low || 0) + (severityCounts.info || 0)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Verified Defects: {classificationCounts.verified_defect || 0}</span>
            <span>Needs Review: {classificationCounts.needs_review || 0}</span>
          </div>
        </div>

        {/* Snapshot Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-slate-500" />
            <span>HTML Page Snapshot</span>
          </h4>

          <dl className="space-y-2 text-xs">
            <div className="flex items-start justify-between py-1 border-b border-slate-100">
              <dt className="text-slate-500">Page Title</dt>
              <dd className="font-medium text-slate-900 text-right max-w-xs truncate pl-2">
                {page_snapshot?.title || (
                  <span className="text-rose-600 font-semibold">Missing &lt;title&gt;</span>
                )}
              </dd>
            </div>

            <div className="flex items-start justify-between py-1 border-b border-slate-100">
              <dt className="text-slate-500">Meta Description</dt>
              <dd className="font-medium text-slate-900 text-right max-w-xs truncate pl-2">
                {page_snapshot?.meta_description || (
                  <span className="text-amber-600">Not provided</span>
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <dt className="text-slate-500">HTML Payload Weight</dt>
              <dd className="font-mono text-slate-800">
                {formatBytes(page_snapshot?.html_bytes || 0)}
              </dd>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <dt className="text-slate-500">Detected Elements</dt>
              <dd className="text-slate-700">
                {imagesList.length} images • {linksList.length} links •{' '}
                {buttonsList.length} buttons
              </dd>
            </div>

            <div className="flex items-center justify-between py-1">
              <dt className="text-slate-500">Main Heading (H1)</dt>
              <dd className="text-slate-900 font-medium">
                {h1List.length > 0 ? (
                  `${h1List.length} found`
                ) : (
                  <span className="text-rose-600 font-semibold">No H1 element</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
