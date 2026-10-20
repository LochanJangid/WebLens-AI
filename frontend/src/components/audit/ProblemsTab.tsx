'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Search,
  Check,
  Terminal,
  ExternalLink,
  Code,
} from 'lucide-react';
import { Finding, PageSnapshot } from '@/types/api';
import { SeverityBadge, CategoryBadge, ClassificationBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

interface ProblemsTabProps {
  findings: Finding[];
  pageUrl: string;
  pageSnapshot: PageSnapshot;
  onNavigateToElementFix: (findingId: string) => void;
  onNavigateToPrompt: (finding: Finding) => void;
}

export function ProblemsTab({
  findings = [],
  pageUrl,
  pageSnapshot,
  onNavigateToElementFix,
  onNavigateToPrompt,
}: ProblemsTabProps) {
  const [selectedClassification, setSelectedClassification] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [explainingIds, setExplainingIds] = useState<Record<string, boolean>>({});
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});

  const findingsList = Array.isArray(findings) ? findings : [];

  // Toggle accordion item
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleExplainWithAi = async (finding: Finding) => {
    if (aiExplanations[finding.id]) return;
    setExplainingIds((prev) => ({ ...prev, [finding.id]: true }));

    try {
      const res = await api.explainFindings(
        finding.page_url || pageUrl,
        [finding],
        pageSnapshot
      );

      const item = res.findings?.[0];
      const explanationText =
        item?.explanation ||
        (Array.isArray(item?.steps) && item.steps.length > 0 ? item.steps.join('\n') : 'Detailed explanation available.');

      setAiExplanations((prev) => ({
        ...prev,
        [finding.id]: explanationText,
      }));
    } catch {
      setAiExplanations((prev) => ({
        ...prev,
        [finding.id]:
          'Could not retrieve live AI explanation. Please follow the concrete fix and verification instructions below.',
      }));
    } finally {
      setExplainingIds((prev) => ({ ...prev, [finding.id]: false }));
    }
  };

  // Filter findings
  const filteredFindings = findingsList.filter((f) => {
    if (selectedClassification !== 'all' && f.classification !== selectedClassification) {
      return false;
    }
    if (selectedCategory !== 'all' && f.category !== selectedCategory) {
      return false;
    }
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (f.title || '').toLowerCase().includes(q);
      const matchWhy = (f.why_it_matters || '').toLowerCase().includes(q);
      const matchChange = (f.suggested_change || '').toLowerCase().includes(q);
      const matchSelector = typeof f.evidence?.selector === 'string' && f.evidence.selector.toLowerCase().includes(q);
      return matchTitle || matchWhy || matchChange || matchSelector;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search issues, elements, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
            />
          </div>

          {/* Quick Stats */}
          <div className="text-xs text-slate-500 font-medium self-center">
            Showing <span className="font-bold text-slate-800">{filteredFindings.length}</span> of{' '}
            <span className="font-bold text-slate-800">{findingsList.length}</span> findings
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Type:
          </span>
          {[
            { id: 'all', label: 'All Types' },
            { id: 'verified_defect', label: 'Verified Defects' },
            { id: 'potential_issue', label: 'Potential Issues' },
            { id: 'recommendation', label: 'Recommendations' },
            { id: 'needs_review', label: 'Needs Review' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedClassification(tab.id)}
              className={cn(
                'px-2.5 py-1 rounded-md font-medium transition-colors',
                selectedClassification === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ml-auto px-2 py-1 rounded-md text-xs bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="performance">Performance</option>
            <option value="accessibility">Accessibility</option>
            <option value="seo">SEO</option>
            <option value="content">Content</option>
            <option value="ux">UX</option>
            <option value="best-practices">Best Practices</option>
          </select>

          {/* Severity Dropdown Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2 py-1 rounded-md text-xs bg-slate-100 border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-600"
            aria-label="Filter by priority"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-900">No issues match the selected filters</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, category, or priority filters to see other findings.
          </p>
          <button
            onClick={() => {
              setSelectedClassification('all');
              setSelectedCategory('all');
              setSelectedSeverity('all');
              setSearchQuery('');
            }}
            className="mt-4 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => {
            const isExpanded = !!expandedIds[finding.id];
            const hasAiExplanation = !!aiExplanations[finding.id];
            const isExplaining = !!explainingIds[finding.id];
            const selector = finding.evidence?.selector;

            return (
              <div
                key={finding.id}
                id={`finding-${finding.id}`}
                className={cn(
                  'bg-white rounded-xl border transition-all duration-200 shadow-xs overflow-hidden',
                  isExpanded ? 'border-slate-300 ring-1 ring-slate-200' : 'border-slate-200 hover:border-slate-300'
                )}
              >
                {/* Header Row */}
                <div
                  onClick={() => toggleExpand(finding.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <SeverityBadge severity={finding.severity} />
                      <CategoryBadge category={finding.category} />
                      <ClassificationBadge classification={finding.classification} />
                      {finding.source === 'html_rule' && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          HTML Inspector
                        </span>
                      )}
                      {finding.source === 'lighthouse' && (
                        <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                          Lighthouse
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {finding.title}
                    </h4>

                    {selector && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                        <Code className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 truncate max-w-md">
                          {selector}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      aria-label={isExpanded ? 'Collapse issue details' : 'Expand issue details'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 border-t border-slate-100 bg-slate-50/40 space-y-4 pt-4">
                    {/* The 5 Key Answers breakdown for this finding */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* What is wrong & Why it matters */}
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            1. What is wrong?
                          </span>
                          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                            {finding.why_it_matters ? finding.suggested_change : finding.title}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            2. Why does it matter?
                          </span>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {finding.why_it_matters}
                          </p>
                        </div>
                      </div>

                      {/* How to fix & Verification */}
                      <div className="space-y-3">
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider block mb-1">
                            3. Recommended Fix & Steps
                          </span>
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-1.5">
                            {finding.suggested_change}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {finding.implementation_hint}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                            4. How to Verify
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {finding.verification}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Element Evidence Details */}
                    {finding.evidence && Object.keys(finding.evidence).length > 0 && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Audited Element Evidence
                        </span>
                        <div className="space-y-1 font-mono text-[11px] text-slate-700">
                          {finding.evidence.selector && (
                            <div>
                              <span className="text-slate-400">Selector:</span>{' '}
                              <span className="text-slate-900 font-semibold">{finding.evidence.selector}</span>
                            </div>
                          )}
                          {finding.evidence.text && (
                            <div>
                              <span className="text-slate-400">Observed text:</span>{' '}
                              <span className="text-slate-800">"{finding.evidence.text}"</span>
                            </div>
                          )}
                          {finding.evidence.observed && (
                            <div>
                              <span className="text-slate-400">Observed state:</span>{' '}
                              <span className="text-slate-800">{finding.evidence.observed}</span>
                            </div>
                          )}
                          {typeof finding.evidence.count === 'number' && (
                            <div>
                              <span className="text-slate-400">Count of affected items:</span>{' '}
                              <span className="text-slate-900 font-bold">{finding.evidence.count}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI Plain Language Explanation */}
                    {hasAiExplanation && (
                      <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-200 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-brand-900 mb-1.5">
                          <Sparkles className="w-4 h-4 text-brand-600" />
                          <span>Plain English Explanation</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {aiExplanations[finding.id]}
                        </p>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        {!hasAiExplanation && (
                          <button
                            type="button"
                            onClick={() => handleExplainWithAi(finding)}
                            disabled={isExplaining}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                            <span>{isExplaining ? 'Translating...' : 'Explain with AI'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onNavigateToElementFix(finding.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                          <span>Exact Element Improvement</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigateToPrompt(finding)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                      >
                        <Terminal className="w-3.5 h-3.5 text-blue-300" />
                        <span>Generate AI Coding Prompt</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
