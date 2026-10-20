'use client';

import React, { useState } from 'react';
import {
  Code,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  CheckSquare,
  Square,
  Eye,
  FileText,
} from 'lucide-react';
import { Finding, PageSnapshot } from '@/types/api';
import { SeverityBadge, CategoryBadge, ClassificationBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

interface ElementImprovementsTabProps {
  findings: Finding[];
  pageUrl: string;
  pageSnapshot: PageSnapshot;
  onGeneratePromptForFinding: (finding: Finding) => void;
  targetFindingId?: string | null;
  initialReviewedIds?: string[];
  onReviewedIdsChange?: (reviewedIds: string[]) => void;
}

export function ElementImprovementsTab({
  findings = [],
  pageUrl,
  pageSnapshot,
  onGeneratePromptForFinding,
  targetFindingId,
  initialReviewedIds,
  onReviewedIdsChange,
}: ElementImprovementsTabProps) {
  const [reviewedIds, setReviewedIds] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    if (Array.isArray(initialReviewedIds)) {
      initialReviewedIds.forEach((id) => {
        map[id] = true;
      });
    }
    return map;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [explainingIds, setExplainingIds] = useState<Record<string, boolean>>({});
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const findingsList = Array.isArray(findings) ? findings : [];

  // Toggle reviewed status in local state
  const toggleReviewed = (id: string) => {
    setReviewedIds((prev) => {
      const updated = {
        ...prev,
        [id]: !prev[id],
      };
      if (onReviewedIdsChange) {
        const activeList = Object.entries(updated)
          .filter(([, v]) => Boolean(v))
          .map(([k]) => k);
        onReviewedIdsChange(activeList);
      }
      return updated;
    });
  };

  const handleExplain = async (finding: Finding) => {
    if (aiExplanations[finding.id]) return;
    setExplainingIds((prev) => ({ ...prev, [finding.id]: true }));

    try {
      const res = await api.explainFindings(
        finding.page_url || pageUrl,
        [finding],
        pageSnapshot
      );

      const explanation =
        res.findings?.[0]?.explanation ||
        (Array.isArray(res.findings?.[0]?.steps) && res.findings[0].steps.length > 0
          ? res.findings[0].steps.join('\n')
          : 'Explanation generated.');

      setAiExplanations((prev) => ({
        ...prev,
        [finding.id]: explanation,
      }));
    } catch {
      setAiExplanations((prev) => ({
        ...prev,
        [finding.id]:
          'Could not retrieve live AI explanation. Please follow the concrete suggested replacement and verification instructions provided.',
      }));
    } finally {
      setExplainingIds((prev) => ({ ...prev, [finding.id]: false }));
    }
  };

  const handleQuickCopyPrompt = async (finding: Finding) => {
    const promptText = `Fix this website issue on ${finding.page_url || pageUrl}:
Target Element / Selector: ${finding.evidence?.selector || 'Page-level suggestion'}
Problem: ${finding.why_it_matters}
Proposed Change: ${finding.suggested_change}
Implementation Hint: ${finding.implementation_hint}
Verification: ${finding.verification}

Please implement the suggested change cleanly without modifying unrelated elements or inventing business facts.`;

    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPromptId(finding.id);
      setTimeout(() => setCopiedPromptId(null), 2500);
    } catch {
      // Fallback
    }
  };

  // Filter findings safely
  const filteredFindings = findingsList.filter((f) => {
    const isRev = !!reviewedIds[f.id];
    if (activeFilter === 'pending' && isRev) return false;
    if (activeFilter === 'reviewed' && !isRev) return false;
    return true;
  });

  const reviewedCount = Object.values(reviewedIds).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header Explainer Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Exact Element & Section Improvements
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            WebLens avoids vague advice like "improve your CSS". Instead, we map findings directly to specific DOM selectors, headings, attributes, or sections where sufficient evidence exists.
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold transition-colors',
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            All ({findingsList.length})
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold transition-colors',
              activeFilter === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Pending ({Math.max(0, findingsList.length - reviewedCount)})
          </button>
          <button
            onClick={() => setActiveFilter('reviewed')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold transition-colors',
              activeFilter === 'reviewed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Reviewed ({reviewedCount})
          </button>
        </div>
      </div>

      {/* Elements List */}
      {filteredFindings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900">
            {activeFilter === 'reviewed'
              ? 'No reviewed elements yet'
              : 'All element recommendations reviewed!'}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {activeFilter === 'reviewed'
              ? 'Mark elements as reviewed as you inspect or implement them.'
              : 'Switch filter to "All" to inspect element details.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredFindings.map((finding) => {
            const isTarget = targetFindingId === finding.id;
            const isReviewed = !!reviewedIds[finding.id];
            const selector = finding.evidence?.selector;
            const hasExactSelector = typeof selector === 'string' && selector.trim().length > 0;
            const examplesList = Array.isArray(finding.evidence?.examples) ? finding.evidence.examples : [];
            const observedText =
              finding.evidence?.text ||
              finding.evidence?.observed ||
              (examplesList.length > 0 ? `${examplesList.length} affected elements` : null);

            return (
              <div
                key={finding.id}
                id={`element-fix-${finding.id}`}
                className={cn(
                  'bg-white rounded-2xl border transition-all duration-200 shadow-xs overflow-hidden',
                  isTarget ? 'ring-2 ring-brand-500 border-brand-400' : 'border-slate-200 hover:border-slate-300',
                  isReviewed && 'opacity-75 bg-slate-50/50'
                )}
              >
                {/* Element Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/40">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <SeverityBadge severity={finding.severity} />
                      <CategoryBadge category={finding.category} />
                      <ClassificationBadge classification={finding.classification} />
                      {hasExactSelector ? (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                          <Code className="w-3 h-3" />
                          DOM Selector Available
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Page-Level Recommendation
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{finding.title}</span>
                      {isReviewed && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Reviewed
                        </span>
                      )}
                    </h4>

                    {/* URL and Selector Pill */}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-slate-400 font-medium">Page:</span>
                      <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {finding.page_url || pageUrl}
                      </span>
                      {hasExactSelector && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 font-medium">Selector:</span>
                          <span className="font-mono text-slate-900 bg-slate-200/70 font-semibold px-2 py-0.5 rounded">
                            {selector}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Top Right Review Button */}
                  <button
                    type="button"
                    onClick={() => toggleReviewed(finding.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all self-start md:self-center',
                      isReviewed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    )}
                  >
                    {isReviewed ? (
                      <>
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <span>Marked as Reviewed</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 text-slate-400" />
                        <span>Mark as Reviewed</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Content Body */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* Current vs Proposed Visual Comparison Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Observed Element Content */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        <span>Actual Observed State / Content</span>
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                      </div>

                      {observedText ? (
                        <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {observedText}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-500 italic">
                          No text attribute was present in HTML snapshot. Element is missing or empty.
                        </div>
                      )}

                      <div className="mt-3">
                        <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block mb-0.5">
                          Problem in plain English
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {finding.why_it_matters}
                        </p>
                      </div>
                    </div>

                    {/* Proposed Replacement / Improvement */}
                    <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/40">
                      <div className="flex items-center justify-between text-xs font-bold text-brand-800 uppercase tracking-wider mb-2">
                        <span>Proposed Replacement / Solution</span>
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-brand-200 text-xs font-semibold text-brand-900 leading-relaxed shadow-2xs">
                        {finding.suggested_change}
                      </div>

                      <div className="mt-3">
                        <span className="text-[11px] font-bold text-brand-800 uppercase tracking-wider block mb-0.5">
                          Why this element needs improvement
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {finding.implementation_hint}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Implementation Steps & Verification Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Implementation Steps */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 mb-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        Implementation Instructions
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {finding.implementation_hint}
                      </p>
                      {finding.evidence?.selector && (
                        <div className="mt-3 text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                          Target selector: <code className="text-slate-900 font-bold">{finding.evidence.selector}</code>
                        </div>
                      )}
                    </div>

                    {/* Verification Instructions */}
                    <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Verification Instructions
                      </span>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        {finding.verification}
                      </p>
                      <div className="mt-3 text-[11px] text-slate-500">
                        Always test in browser developer tools (F12) to ensure no responsive layout shift occurs.
                      </div>
                    </div>
                  </div>

                  {/* AI Plain English Explanation if requested */}
                  {aiExplanations[finding.id] && (
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-1.5">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>Plain English Explanation</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                        {aiExplanations[finding.id]}
                      </p>
                    </div>
                  )}

                  {/* Bottom Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {!aiExplanations[finding.id] && (
                        <button
                          type="button"
                          onClick={() => handleExplain(finding)}
                          disabled={explainingIds[finding.id]}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                          <span>
                            {explainingIds[finding.id]
                              ? 'Analyzing...'
                              : 'Explain this problem'}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleQuickCopyPrompt(finding)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        {copiedPromptId === finding.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied prompt!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy Quick Prompt</span>
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onGeneratePromptForFinding(finding)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <Terminal className="w-3.5 h-3.5 text-blue-300" />
                      <span>Open in AI Prompt Studio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
