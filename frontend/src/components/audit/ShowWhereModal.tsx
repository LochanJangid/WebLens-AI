'use strict';
/* eslint-disable @next/next/no-img-element */

import React from 'react';
import { X, Eye, Wrench, AlertCircle, ArrowRight, Layers } from 'lucide-react';
import type { MeaningfulIssue } from '@/services/intelligence';
import type { VisualAuditResponse } from '@/types/api';

interface ShowWhereModalProps {
  issue: MeaningfulIssue | null;
  visual: VisualAuditResponse | null;
  onClose: () => void;
  onHelpFix?: (issue: MeaningfulIssue) => void;
  onOpenInspect?: (issue: MeaningfulIssue) => void;
}

export function ShowWhereModal({
  issue,
  visual,
  onClose,
  onHelpFix,
  onOpenInspect,
}: ShowWhereModalProps) {
  if (!issue) return null;

  const activeScreenshot = visual?.viewport_screenshot || visual?.full_page_screenshot;
  const viewport = visual?.viewport || { width: 1280, height: 800 };

  // Match annotation by selector or finding id
  const matchingAnnotation = visual?.annotations?.find(
    (a) =>
      (issue.selector && a.selector && a.selector.includes(issue.selector)) ||
      (issue.originalFinding?.id && a.finding_id === issue.originalFinding.id) ||
      a.title.toLowerCase().includes(issue.title.toLowerCase().slice(0, 15))
  );

  const hasLocation = Boolean(activeScreenshot && matchingAnnotation?.box);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-4xl rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#0B0B0D] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(255,255,255,0.08)] pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F20D4F]/10 text-[#F20D4F] border border-[#F20D4F]/20">
                <Eye className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#777781]">
                Visual Location Inspector
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F7F7F8]">
              {issue.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#777781] hover:bg-[#17171B] hover:text-[#F7F7F8] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#050505] p-2 relative min-h-[300px]">
          {hasLocation && matchingAnnotation && activeScreenshot ? (
            <div className="relative inline-block min-w-full">
              <img
                src={activeScreenshot}
                alt="Audited Website Screenshot"
                className="block w-full h-auto rounded-lg"
              />

              {/* Exact Highlight Box */}
              <div
                className="absolute pointer-events-none rounded-lg border-2 border-[#F20D4F] bg-[#F20D4F]/15 ring-4 ring-[#F20D4F]/40 transition-all z-20"
                style={{
                  left: `${(matchingAnnotation.box.x / viewport.width) * 100}%`,
                  top: `${(matchingAnnotation.box.y / viewport.height) * 100}%`,
                  width: `${Math.max(3, (matchingAnnotation.box.width / viewport.width) * 100)}%`,
                  height: `${Math.max(2, (matchingAnnotation.box.height / viewport.height) * 100)}%`,
                }}
              >
                {/* Floating Issue Label Badge */}
                <div className="absolute -top-7 left-0 whitespace-nowrap rounded-md bg-[#F20D4F] px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
                  {issue.title.slice(0, 36)}...
                </div>
              </div>
            </div>
          ) : (
            /* Fallback when no precise bounding box exists */
            <div className="p-8 text-center max-w-md mx-auto space-y-4 my-8">
              <div className="h-12 w-12 rounded-full bg-amber-950/50 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#F7F7F8]">
                  No Visible On-Screen Element to Highlight
                </h4>
                <p className="text-xs text-[#B4B4BD] leading-relaxed">
                  This finding relates to page-wide performance (such as overall server response time or background scripts) or head tags not rendered visually in the body.
                </p>
              </div>

              {issue.selector && (
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-3 text-left text-xs font-mono text-[#F7F7F8]">
                  <span className="text-[#777781] block text-[10px] uppercase font-sans font-bold">
                    Target Selector
                  </span>
                  {issue.selector}
                </div>
              )}

              {issue.elementText && (
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-3 text-left text-xs text-[#F7F7F8] italic">
                  <span className="text-[#777781] block text-[10px] uppercase font-sans font-bold not-italic">
                    Text Evidence
                  </span>
                  &ldquo;{issue.elementText}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Bar with 1 Obvious Next Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-[#777781]">
            {hasLocation
              ? 'Highlighted element indicated with precision crimson target.'
              : 'Refer to the fix guide for step-by-step instructions.'}
          </div>

          <div className="flex items-center gap-2">
            {onOpenInspect && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInspect(issue);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs font-semibold shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Full-Screen Inspector</span>
              </button>
            )}
            {onHelpFix && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onHelpFix(issue);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17171B] hover:bg-[#222228] text-[#F7F7F8] border border-[rgba(255,255,255,0.1)] text-xs font-semibold transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Help me fix it</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111114] hover:bg-[#17171B] text-[#B4B4BD] border border-[rgba(255,255,255,0.06)] text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
