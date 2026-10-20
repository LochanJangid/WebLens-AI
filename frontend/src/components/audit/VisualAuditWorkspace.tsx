'use strict';
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Code,
  Sparkles,
  Target,
} from 'lucide-react';
import type { VisualAuditResponse, VisualAnnotation, FindingSeverity } from '../../types/api';

interface VisualAuditWorkspaceProps {
  visual: VisualAuditResponse | null;
  isLoading?: boolean;
  onRefreshVisual?: (strategy: 'mobile' | 'desktop') => void;
  activeStrategy?: 'mobile' | 'desktop';
}

const SEVERITY_COLORS: Record<
  FindingSeverity,
  { bg: string; text: string; border: string; badge: string; ring: string }
> = {
  critical: {
    bg: 'bg-[rgba(242,13,79,0.18)]',
    text: 'text-[#F20D4F]',
    border: 'border-[#F20D4F]',
    badge: 'bg-[#F20D4F] text-white',
    ring: 'ring-[#F20D4F]/30',
  },
  high: {
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    border: 'border-orange-500',
    badge: 'bg-orange-600 text-white',
    ring: 'ring-orange-400/30',
  },
  medium: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500',
    badge: 'bg-amber-600 text-black',
    ring: 'ring-amber-400/30',
  },
  low: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
    badge: 'bg-emerald-600 text-white',
    ring: 'ring-emerald-400/30',
  },
  info: {
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500',
    badge: 'bg-slate-700 text-white',
    ring: 'ring-slate-400/30',
  },
};

export const VisualAuditWorkspace: React.FC<VisualAuditWorkspaceProps> = ({
  visual,
  isLoading = false,
  onRefreshVisual,
  activeStrategy = 'desktop',
}) => {
  const [selectedAnnoId, setSelectedAnnoId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'viewport' | 'full_page'>('viewport');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const annotations = useMemo(() => visual?.annotations || [], [visual?.annotations]);

  // Default select first annotation when annotations load
  useEffect(() => {
    if (annotations.length > 0 && !selectedAnnoId) {
      setSelectedAnnoId(annotations[0].id);
    }
  }, [annotations, selectedAnnoId]);

  const activeAnnotation = useMemo(
    () => annotations.find((a) => a.id === selectedAnnoId) || annotations[0] || null,
    [annotations, selectedAnnoId]
  );

  const filteredAnnotations = useMemo(() => {
    if (severityFilter === 'all') return annotations;
    return annotations.filter((a) => a.severity === severityFilter);
  }, [annotations, severityFilter]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(200, Math.max(50, prev + delta)));
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const activeScreenshot =
    viewMode === 'full_page'
      ? visual?.full_page_screenshot || visual?.viewport_screenshot
      : visual?.viewport_screenshot;

  const targetDims =
    viewMode === 'full_page'
      ? visual?.full_page_dimensions || visual?.viewport || { width: 1280, height: 800 }
      : visual?.viewport || { width: 1280, height: 800 };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-12 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#111114] border border-[rgba(242,13,79,0.35)] shadow-accent">
          <Target className="h-6 w-6 text-[#F20D4F] animate-spin" />
        </div>
        <h3 className="text-base font-bold text-[#F7F7F8]">
          Capturing Precision Screenshot...
        </h3>
        <p className="mt-1 text-xs text-[#B4B4BD]">
          Playwright Chromium is measuring element bounds and rendering the {activeStrategy} viewport.
        </p>
        <div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-[#17171B]">
          <div className="h-full w-1/2 animate-[shimmer_1.5s_infinite] bg-[#F20D4F] rounded-full" />
        </div>
      </div>
    );
  }

  // If failed or no screenshot
  if (!visual || visual.failed || !activeScreenshot) {
    return (
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-10 shadow-card">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-[#F7F7F8]">
            Visual Snapshot Currently Unavailable
          </h3>
          <p className="mt-2 text-sm text-[#B4B4BD]">
            {visual?.error ||
              'A visual screenshot could not be captured. This often happens if the website uses bot mitigation or blocks automated headless browsers.'}
          </p>
          <div className="mt-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111114] p-4 text-left text-xs text-[#B4B4BD]">
            <p className="font-semibold text-[#F7F7F8]">Audit Still Complete:</p>
            <p className="mt-1">
              All DOM inspection findings, Lighthouse scores, and AI coding prompts remain fully
              accessible in the other tabs above.
            </p>
          </div>
          {onRefreshVisual && (
            <button
              onClick={() => onRefreshVisual(activeStrategy)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] px-4 py-2.5 text-sm font-semibold text-white transition shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)]"
            >
              <Eye className="h-4 w-4" /> Retry Visual Capture
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 select-none">
      {/* Workspace Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] px-5 py-3 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          {/* Viewport switch: Desktop / Mobile */}
          <div className="flex items-center rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.08)] p-1">
            <button
              onClick={() => onRefreshVisual && onRefreshVisual('desktop')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                activeStrategy === 'desktop'
                  ? 'bg-[#17171B] text-[#F7F7F8] shadow-xs'
                  : 'text-[#777781] hover:text-[#F7F7F8]'
              }`}
              title="Inspect Desktop Layout (1280px)"
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              onClick={() => onRefreshVisual && onRefreshVisual('mobile')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                activeStrategy === 'mobile'
                  ? 'bg-[#17171B] text-[#F7F7F8] shadow-xs'
                  : 'text-[#777781] hover:text-[#F7F7F8]'
              }`}
              title="Inspect Mobile Layout (390px)"
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>

          {/* Mode switch: Viewport / Full Page */}
          <div className="flex items-center rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.08)] p-1">
            <button
              onClick={() => setViewMode('viewport')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'viewport'
                  ? 'bg-[#17171B] text-[#F7F7F8] shadow-xs'
                  : 'text-[#777781] hover:text-[#F7F7F8]'
              }`}
            >
              Above the Fold
            </button>
            <button
              onClick={() => setViewMode('full_page')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                viewMode === 'full_page'
                  ? 'bg-[#17171B] text-[#F7F7F8] shadow-xs'
                  : 'text-[#777781] hover:text-[#F7F7F8]'
              }`}
            >
              Full Page Scroll
            </button>
          </div>

          {/* AI Vision Studio Direct Link (Replaced old Improved / Compare section) */}
          <Link
            href={`/audit/inspect?strategy=${activeStrategy}&mode=vision_hub`}
            className="flex items-center gap-1.5 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-pink-200" />
            <span>AI Vision Studio</span>
          </Link>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111114] p-0.5">
            <button
              onClick={() => handleZoom(-25)}
              disabled={zoomLevel <= 50}
              className="rounded-lg p-1.5 text-[#777781] hover:text-[#F7F7F8] disabled:opacity-40"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center text-xs font-mono font-semibold text-[#F7F7F8]">
              {zoomLevel}%
            </span>
            <button
              onClick={() => handleZoom(25)}
              disabled={zoomLevel >= 200}
              className="rounded-lg p-1.5 text-[#777781] hover:text-[#F7F7F8] disabled:opacity-40"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoomLevel(100)}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111114] p-1.5 text-[#777781] hover:text-[#F7F7F8] transition"
            title="Reset Zoom to 100%"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left / Center Area: Annotated Screenshot */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-4 shadow-card">
            <div
              ref={containerRef}
              className="relative max-h-[720px] overflow-auto rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#050505] shadow-inner"
            >
              {/* Interactive Screenshot View with Overlay Reticle Badges */}
              <div
                className="relative origin-top-left transition-transform duration-100 ease-out inline-block"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  minWidth: '100%',
                }}
              >
                <img
                  src={activeScreenshot}
                  alt="Audited Website Screenshot"
                  className="block w-full h-auto"
                  style={{ minWidth: `${targetDims.width}px` }}
                />

                {/* SVG & HTML Annotation Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    width: `${targetDims.width}px`,
                    height: `${targetDims.height}px`,
                  }}
                >
                  {filteredAnnotations.map((anno) => {
                    const isSelected = selectedAnnoId === anno.id;
                    const colors = SEVERITY_COLORS[anno.severity] || SEVERITY_COLORS.medium;
                    const { x, y, width, height } = anno.box;

                    return (
                      <div
                        key={anno.id}
                        className="pointer-events-auto absolute transition-all duration-150"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          width: `${Math.max(28, width)}px`,
                          height: `${Math.max(28, height)}px`,
                        }}
                      >
                        {/* Bounding Box Border */}
                        <button
                          type="button"
                          onClick={() => setSelectedAnnoId(anno.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedAnnoId(anno.id);
                            }
                          }}
                          className={`group relative h-full w-full rounded-md border-2 transition-all ${
                            isSelected
                              ? `${colors.border} ${colors.bg} ring-4 ${colors.ring} z-30`
                              : `border-dashed ${colors.border}/80 hover:${colors.bg} hover:border-solid z-10`
                          }`}
                          aria-label={`Annotation ${anno.number}: ${anno.title} (${anno.severity})`}
                        >
                          {/* Numbered Pill Badge */}
                          <span
                            className={`absolute -left-2.5 -top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shadow-card transition-transform group-hover:scale-110 ${
                              colors.badge
                            } ${isSelected ? 'scale-110 ring-2 ring-white' : ''}`}
                          >
                            {anno.number}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Caption Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-[#777781]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#B4B4BD]">Dimensions:</span>
                <span>
                  {targetDims.width} × {targetDims.height}px
                </span>
                <span>·</span>
                <span>
                  {annotations.length} verified visual region{annotations.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div>
                Click any numbered reticle or card to synchronize location and prompt.
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Synchronized Issues Side Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-4">
          {/* Severity Filter Pills */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-4 shadow-card">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#777781]">
                Visual Findings ({filteredAnnotations.length})
              </h4>
              <span className="text-xs font-medium text-[#777781]">Filtered by severity</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => {
                const count =
                  sev === 'all'
                    ? annotations.length
                    : annotations.filter((a) => a.severity === sev).length;
                return (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                      severityFilter === sev
                        ? 'bg-[#F20D4F] text-white shadow-xs'
                        : 'bg-[#111114] text-[#B4B4BD] hover:bg-[#17171B]'
                    }`}
                  >
                    {sev} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Issue Details Card */}
          {activeAnnotation ? (
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-5 shadow-card space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-[rgba(255,255,255,0.06)] pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      SEVERITY_COLORS[activeAnnotation.severity]?.badge || 'bg-[#F20D4F] text-white'
                    }`}
                  >
                    {activeAnnotation.number}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      SEVERITY_COLORS[activeAnnotation.severity]?.bg
                    } ${SEVERITY_COLORS[activeAnnotation.severity]?.text}`}
                  >
                    {activeAnnotation.severity}
                  </span>
                  <span className="rounded-md bg-[#17171B] border border-[rgba(255,255,255,0.06)] px-2 py-0.5 text-xs font-medium text-[#B4B4BD] capitalize">
                    {activeAnnotation.category}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#777781]">
                  x:{activeAnnotation.box.x} y:{activeAnnotation.box.y}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#F7F7F8] leading-snug">
                  {activeAnnotation.title}
                </h3>
                {activeAnnotation.selector && (
                  <p className="mt-1 font-mono text-xs text-[#F20D4F] break-all bg-[rgba(242,13,79,0.1)] p-1.5 rounded-lg border border-[rgba(242,13,79,0.25)]">
                    {activeAnnotation.selector}
                  </p>
                )}
              </div>

              {/* Measured Evidence */}
              {activeAnnotation.element_text && (
                <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111114] p-3 text-xs">
                  <span className="font-semibold text-[#B4B4BD]">DOM Text Excerpt:</span>
                  <p className="mt-0.5 font-mono text-[#777781] italic">
                    &ldquo;{activeAnnotation.element_text}&rdquo;
                  </p>
                </div>
              )}

              {/* Why It Matters */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#777781]">
                  Why It Matters
                </h5>
                <p className="mt-1 text-xs text-[#B4B4BD] leading-relaxed">
                  {activeAnnotation.why_it_matters}
                </p>
              </div>

              {/* Practical Fix */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Practical Fix
                </div>
                <p className="mt-1 text-xs text-emerald-300 leading-relaxed">
                  {activeAnnotation.suggested_change}
                </p>
              </div>

              {/* Copyable Coding Agent Prompt */}
              {activeAnnotation.agent_prompt && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#F7F7F8]">
                      <Code className="h-3.5 w-3.5 text-[#F20D4F]" /> Antigravity Agent Prompt
                    </span>
                    <button
                      onClick={() =>
                        handleCopyPrompt(
                          activeAnnotation.agent_prompt || '',
                          activeAnnotation.id
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#F20D4F] hover:text-[#FF245F]"
                    >
                      {copiedPromptId === activeAnnotation.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy Prompt
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="max-h-36 overflow-auto rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#050505] p-3 text-xs font-mono text-[#B4B4BD] whitespace-pre-wrap leading-relaxed">
                    {activeAnnotation.agent_prompt}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-8 text-center text-[#777781] text-sm shadow-card">
              No issue selected. Click an annotation to inspect its details.
            </div>
          )}

          {/* Quick List of All Annotations */}
          <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-4 shadow-card flex-1">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#777781]">
              All Numbered Issues ({annotations.length})
            </h4>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {filteredAnnotations.map((anno) => {
                const isSelected = selectedAnnoId === anno.id;
                const colors = SEVERITY_COLORS[anno.severity] || SEVERITY_COLORS.medium;

                return (
                  <button
                    key={anno.id}
                    onClick={() => setSelectedAnnoId(anno.id)}
                    className={`w-full flex items-center justify-between gap-2 rounded-xl p-2.5 text-left transition border ${
                      isSelected
                        ? 'border-[#F20D4F] bg-[rgba(242,13,79,0.15)] shadow-xs'
                        : 'border-[rgba(255,255,255,0.06)] bg-[#111114] hover:bg-[#17171B]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${colors.badge}`}
                      >
                        {anno.number}
                      </span>
                      <span className="truncate text-xs font-semibold text-[#F7F7F8]">
                        {anno.title}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${colors.bg} ${colors.text}`}
                    >
                      {anno.severity}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
