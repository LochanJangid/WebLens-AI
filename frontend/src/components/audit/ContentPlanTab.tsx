'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  PlusCircle,
  Sparkles,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';
import { ContentPlanResponse, ExistingPageImprovement, Finding, PageSnapshot, ProposedNewPage } from '@/types/api';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

interface ContentPlanTabProps {
  pageUrl: string;
  findings: Finding[];
  pageSnapshot: PageSnapshot;
  initialPlan?: ContentPlanResponse | null;
  onPlanChange?: (plan: ContentPlanResponse) => void;
}

export function ContentPlanTab({
  pageUrl,
  findings,
  pageSnapshot,
  initialPlan,
  onPlanChange,
}: ContentPlanTabProps) {
  const [contentPlan, setContentPlan] = useState<ContentPlanResponse | null>(initialPlan || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<ProposedNewPage | ExistingPageImprovement | null>(null);
  const [briefType, setBriefType] = useState<'new_page' | 'existing' | null>(null);

  const fetchPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.generateContentPlan(pageUrl, findings || [], pageSnapshot);
      setContentPlan(data);
      if (onPlanChange) {
        onPlanChange(data);
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message ||
          'Failed to generate content plan. Please check backend Groq API configuration.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPlan) {
      setContentPlan(initialPlan);
      return;
    }
    if (!contentPlan && !isLoading) {
      fetchPlan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageUrl]);

  // Guaranteed safe fallback arrays to eliminate any TypeError reading length
  const existingImprovements = contentPlan?.existing_page_improvements || [];
  const proposedPages = contentPlan?.proposed_new_pages || [];
  const questionsForOwner = contentPlan?.questions_for_owner || [];
  const assumptions = contentPlan?.assumptions || [];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Content & Missing-Page Strategy
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Evaluates your website content structure to identify weak headlines, missing trust signals, unclear calls-to-action, and recommended new pages grounded in user needs.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPlan}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors self-start md:self-auto shadow-2xs"
        >
          <RefreshCw className={cn('w-3.5 h-3.5 text-slate-500', isLoading && 'animate-spin')} />
          <span>{isLoading ? 'Analyzing Content...' : 'Regenerate Content Plan'}</span>
        </button>
      </div>

      {/* Disclaimers Alert */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Evidence-Grounded Recommendation Policy: </span>
          WebLens never fabricates pricing, customer testimonials, credentials, or business guarantees. Recommendations are suggestions based on standard web communication practices and require owner verification.
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-900">
            Synthesizing Content Improvements
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Analyzing heading structure, text clarity, and user journeys via Groq LLM...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-white rounded-xl border border-rose-200 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-900">Could not generate content plan</h4>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchPlan}
            className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Results Content */}
      {contentPlan && !isLoading && (
        <div className="space-y-8">
          {/* Section 1: Improve Existing Content */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-brand-600" />
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                1. Improve Existing Page Content
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {existingImprovements.length} suggestions
              </span>
            </div>

            {existingImprovements.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                No critical content flaws detected in the scanned text excerpt.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {existingImprovements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {item.issue || 'Content Opportunity'}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 tracking-tight mb-2">
                        {item.issue}
                      </h5>

                      {item.evidence && (
                        <div className="mb-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200 italic line-clamp-2">
                          "{item.evidence}"
                        </div>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {item.explanation}
                      </p>

                      {/* Suggested Content Sample Preview */}
                      {item.suggested_content && (
                        <div className="p-3 rounded-lg bg-brand-50/50 border border-brand-100 text-xs mb-3 space-y-1">
                          <span className="text-[10px] font-bold text-brand-800 uppercase tracking-wider block">
                            Suggested Content Example
                          </span>
                          {item.suggested_content.h1 && (
                            <div>
                              <span className="font-semibold text-slate-700">H1: </span>
                              <span className="text-brand-900 font-bold">"{item.suggested_content.h1}"</span>
                            </div>
                          )}
                          {item.suggested_content.meta_description && (
                            <div className="text-slate-600 line-clamp-2">
                              <span className="font-semibold text-slate-700">Meta: </span>
                              "{item.suggested_content.meta_description}"
                            </div>
                          )}
                          {item.suggested_content.paragraph && (
                            <div className="text-slate-600 line-clamp-2">
                              <span className="font-semibold text-slate-700">Body: </span>
                              "{item.suggested_content.paragraph}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrief(item);
                        setBriefType('existing');
                      }}
                      className="mt-2 inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-brand-700 hover:text-brand-900"
                    >
                      <span>View implementation steps</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Consider Adding New Pages */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                2. Consider Adding New Dedicated Pages
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {proposedPages.length} suggestions
              </span>
            </div>

            {proposedPages.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-center">
                No new dedicated pages are strongly recommended based on this initial page snapshot. WebLens only suggests new pages when clear evidence indicates user or SEO intent.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposedPages.map((page, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-mono">
                          /{page.page_name || page.title?.toLowerCase().replace(/\s+/g, '-')}
                        </span>
                        {page.confidence && (
                          <span className="text-[10px] text-slate-500 capitalize">
                            {page.confidence} confidence
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 tracking-tight mb-1">
                        {page.title || page.page_name}
                      </h5>

                      {page.target_audience && (
                        <p className="text-xs text-slate-500 mb-2">
                          <span className="font-semibold text-slate-700">Target audience:</span>{' '}
                          {page.target_audience}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {page.reason || page.user_need}
                      </p>

                      {page.suggested_sections && page.suggested_sections.length > 0 && (
                        <div className="space-y-1 mb-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Suggested Outline
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {page.suggested_sections.slice(0, 4).map((sec, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                              >
                                {sec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBrief(page);
                        setBriefType('new_page');
                      }}
                      className="mt-2 inline-flex items-center justify-between w-full pt-3 border-t border-slate-100 text-xs font-semibold text-brand-700 hover:text-brand-900"
                    >
                      <span>Read full page brief</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Questions & Assumptions for the Business Owner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionsForOwner.length > 0 && (
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  Key Questions for the Website Owner
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  {questionsForOwner.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-mono text-brand-600 font-bold mt-0.5">{idx + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assumptions.length > 0 && (
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  Assumptions Made in this Content Plan
                </h5>
                <ul className="space-y-2 text-xs text-slate-600">
                  {assumptions.map((a, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400 mt-0.5">•</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Content Brief Modal / Drawer */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-600" />
                <h4 className="text-base font-bold text-slate-900">
                  {briefType === 'new_page' ? 'Proposed Page Brief' : 'Content Improvement Brief'}
                </h4>
              </div>
              <button
                onClick={() => setSelectedBrief(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {briefType === 'new_page' ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Page Title / Route:</span>
                  <p className="text-sm font-bold text-slate-900">
                    {(selectedBrief as ProposedNewPage).title || (selectedBrief as ProposedNewPage).page_name}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Why this page should be considered:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                    {(selectedBrief as ProposedNewPage).reason || (selectedBrief as ProposedNewPage).user_need}
                  </p>
                </div>

                {(selectedBrief as ProposedNewPage).suggested_sections && (
                  <div>
                    <span className="text-slate-400 font-medium">Suggested Section Structure:</span>
                    <ul className="mt-1 space-y-1 list-disc pl-4 text-slate-700">
                      {(selectedBrief as ProposedNewPage).suggested_sections?.map((sec, idx) => (
                        <li key={idx}>{sec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(selectedBrief as ProposedNewPage).suggested_internal_links && (
                  <div>
                    <span className="text-slate-400 font-medium">Internal Link Strategy:</span>
                    <ul className="mt-1 space-y-1 list-disc pl-4 text-slate-700">
                      {(selectedBrief as ProposedNewPage).suggested_internal_links?.map((link, idx) => (
                        <li key={idx}>{link}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Issue to Address:</span>
                  <p className="text-sm font-bold text-slate-900">
                    {(selectedBrief as ExistingPageImprovement).issue}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Detailed Explanation:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                    {(selectedBrief as ExistingPageImprovement).explanation}
                  </p>
                </div>

                {(selectedBrief as ExistingPageImprovement).action_steps && (
                  <div>
                    <span className="text-slate-400 font-medium">Step-by-Step Implementation:</span>
                    <div className="mt-2 space-y-2">
                      {(selectedBrief as ExistingPageImprovement).action_steps?.map((step, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="font-bold text-slate-800">
                            {typeof step === 'object' ? `Step ${step.step}: ` : `Step ${idx + 1}: `}
                          </span>
                          <span className="text-slate-600">
                            {typeof step === 'object' ? step.description : step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedBrief as ExistingPageImprovement).verification && (
                  <div>
                    <span className="text-slate-400 font-medium">How to verify:</span>
                    <p className="text-emerald-800 font-medium mt-0.5">
                      {(selectedBrief as ExistingPageImprovement).verification}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
