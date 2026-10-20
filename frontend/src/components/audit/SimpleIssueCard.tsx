'use strict';

import React, { useState } from 'react';
import {
  Eye,
  Wrench,
  ChevronDown,
  ChevronUp,
  Check,
  CheckCircle2,
  Copy,
  Terminal,
} from 'lucide-react';
import type { MeaningfulIssue } from '@/services/intelligence';

interface SimpleIssueCardProps {
  issue: MeaningfulIssue;
  isFixed?: boolean;
  onToggleFixed?: (id: string) => void;
  onShowWhere?: (issue: MeaningfulIssue) => void;
  onHelpFix?: (issue: MeaningfulIssue) => void;
}

export function SimpleIssueCard({
  issue,
  isFixed = false,
  onToggleFixed,
  onShowWhere,
  onHelpFix,
}: SimpleIssueCardProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleCopyPrompt = () => {
    if (!issue.agentPrompt) return;
    navigator.clipboard.writeText(issue.agentPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const priorityBadge = {
    fix_first: {
      label: 'Fix first',
      className: 'bg-[rgba(242,13,79,0.15)] text-[#F20D4F] border border-[rgba(242,13,79,0.3)]',
      dotColor: 'bg-[#F20D4F]',
    },
    improve_next: {
      label: 'Improve next',
      className: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
      dotColor: 'bg-amber-400',
    },
    optional: {
      label: 'Optional',
      className: 'bg-[#17171B] text-[#B4B4BD] border border-[rgba(255,255,255,0.08)]',
      dotColor: 'bg-[#777781]',
    },
  }[issue.priority];

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isFixed
          ? 'border-emerald-500/30 bg-emerald-500/5 opacity-70'
          : 'border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] shadow-card hover:border-[rgba(242,13,79,0.35)]'
      } p-5 sm:p-6 space-y-4`}
    >
      {/* Top Row: Title, Priority Badge, Category */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityBadge.className}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityBadge.dotColor}`} />
              {priorityBadge.label}
            </span>
            <span className="text-xs text-[#B4B4BD] capitalize bg-[#17171B] border border-[rgba(255,255,255,0.06)] px-2 py-0.5 rounded-md font-medium">
              {issue.category}
            </span>
            {issue.evidenceKind === 'measured' && issue.metricEvidence && (
              <span className="text-xs font-mono font-semibold text-[#F20D4F] bg-[rgba(242,13,79,0.12)] px-2 py-0.5 rounded-md border border-[rgba(242,13,79,0.3)]">
                {issue.metricEvidence.name}: {issue.metricEvidence.value}
              </span>
            )}
          </div>
          <h3
            className={`text-base sm:text-lg font-bold text-[#F7F7F8] leading-snug pt-1 ${
              isFixed ? 'line-through text-[#777781]' : ''
            }`}
          >
            {issue.title}
          </h3>
        </div>

        {/* Mark as Fixed Toggle */}
        {onToggleFixed && (
          <button
            type="button"
            onClick={() => onToggleFixed(issue.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
              isFixed
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#17171B] border border-[rgba(255,255,255,0.08)] text-[#B4B4BD] hover:text-[#F7F7F8] hover:bg-[#222228]'
            }`}
            title="Mark progress locally"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{isFixed ? 'Marked Fixed' : 'Mark as Fixed'}</span>
          </button>
        )}
      </div>

      {/* The Problem & Why It Matters */}
      <div className="space-y-1.5 text-sm text-[#B4B4BD] leading-relaxed">
        <p className="font-normal text-[#F7F7F8]">{issue.problem}</p>
        <p className="text-xs text-[#777781]">{issue.whyItMatters}</p>
      </div>

      {/* How to Fix It */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111114] p-3.5 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#F7F7F8]">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          <span>How to fix it</span>
        </div>
        <p className="text-xs text-[#B4B4BD] leading-relaxed">{issue.recommendedFix}</p>
      </div>

      {/* Action Buttons: Show me where & Help me fix it */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {onShowWhere && (
            <button
              type="button"
              onClick={() => onShowWhere(issue)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#17171B] text-[#F7F7F8] hover:bg-[#222228] border border-[rgba(255,255,255,0.08)] transition shadow-xs"
            >
              <Eye className="h-3.5 w-3.5 text-[#F20D4F]" />
              <span>Show me where</span>
            </button>
          )}

          {onHelpFix && (
            <button
              type="button"
              onClick={() => onHelpFix(issue)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F20D4F] text-white hover:bg-[#FF245F] transition shadow-[0_0_12px_-2px_rgba(242,13,79,0.3)]"
            >
              <Wrench className="h-3.5 w-3.5 text-pink-200" />
              <span>Help me fix it</span>
            </button>
          )}
        </div>

        {/* Expandable Technical Details Trigger */}
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="inline-flex items-center gap-1 text-xs text-[#777781] hover:text-[#F7F7F8] font-medium py-1 transition"
        >
          <span>See technical details</span>
          {showTechnicalDetails ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Technical Section */}
      {showTechnicalDetails && (
        <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-3 text-xs animate-fade-in">
          {issue.selector && (
            <div>
              <span className="font-semibold text-[#B4B4BD]">DOM Selector:</span>
              <p className="mt-0.5 font-mono text-xs text-[#F20D4F] bg-[rgba(242,13,79,0.1)] p-1.5 rounded-lg border border-[rgba(242,13,79,0.25)] break-all">
                {issue.selector}
              </p>
            </div>
          )}

          {issue.elementText && (
            <div>
              <span className="font-semibold text-[#B4B4BD]">Observed HTML Text:</span>
              <p className="mt-0.5 font-mono text-xs text-[#777781] bg-[#111114] p-1.5 rounded-lg border border-[rgba(255,255,255,0.06)] italic">
                &ldquo;{issue.elementText}&rdquo;
              </p>
            </div>
          )}

          {issue.originalFinding?.verification && (
            <div>
              <span className="font-semibold text-[#B4B4BD]">Verification Steps:</span>
              <p className="mt-0.5 text-[#777781]">{issue.originalFinding.verification}</p>
            </div>
          )}

          {issue.agentPrompt && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#B4B4BD] flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-[#F20D4F]" />
                  Antigravity Agent Prompt
                </span>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F20D4F] hover:text-[#FF245F]"
                >
                  {copiedPrompt ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Prompt
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-28 overflow-auto rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#050505] p-2.5 font-mono text-[11px] text-[#B4B4BD] whitespace-pre-wrap leading-relaxed">
                {issue.agentPrompt}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
