'use strict';
/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Globe,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronUp,
  Terminal,
  Layers,
  FileCode,
  Zap,
  Download,
  Target,
} from 'lucide-react';
import type {
  AuditResponse,
  ContentPlanResponse,
  ChatMessage,
  VisualAuditResponse,
} from '@/types/api';
import { api } from '@/services/api';
import { browserStorage } from '@/services/storage';
import {
  processAuditIntelligence,
  groupIssuesBySection,
  type MeaningfulIssue,
  type PageSection,
} from '@/services/intelligence';
import { AuditHeader } from '@/components/audit/AuditHeader';
import { AuditLoadingState } from '@/components/audit/AuditLoadingState';
import { AuditErrorState } from '@/components/audit/AuditErrorState';
import { SimpleIssueCard } from '@/components/audit/SimpleIssueCard';
import { FocusedFixModal } from '@/components/audit/FocusedFixModal';
import { ShowWhereModal } from '@/components/audit/ShowWhereModal';
import { AgentPromptTab } from '@/components/audit/AgentPromptTab';
import { AgentExecutionBridge } from '@/components/agent/AgentExecutionBridge';
import { AuditHistoryModal } from '@/components/audit/AuditHistoryModal';
import { TechnicalDetailsTab } from '@/components/audit/TechnicalDetailsTab';
import { useAssistant } from '@/context/AssistantContext';

function AuditWorkspaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setActiveAudit } = useAssistant();

  const urlParam = searchParams.get('url') || '';
  const strategyParam = (searchParams.get('strategy') as 'mobile' | 'desktop') || 'desktop';
  const pagespeedParam = searchParams.get('pagespeed') !== 'false';

  const [currentUrl, setCurrentUrl] = useState(urlParam);
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>(strategyParam);
  const [includePagespeed, setIncludePagespeed] = useState(pagespeedParam);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);

  // Associated stored session data
  const [visualData, setVisualData] = useState<VisualAuditResponse | null>(null);
  const [isVisualLoading, setIsVisualLoading] = useState(false);
  const [contentPlan, setContentPlan] = useState<ContentPlanResponse | null>(null);
  const [fixedIssueIds, setFixedIssueIds] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [promptDraft, setPromptDraft] = useState<string>('');
  const [savedTimestamp, setSavedTimestamp] = useState<number | null>(null);

  // Prompt copy status
  const [copiedMasterPrompt, setCopiedMasterPrompt] = useState(false);

  // The 3 main areas: Overview | AI Prompts & Agents | Issues to Fix
  const [activeArea, setActiveArea] = useState<'overview' | 'prompts' | 'issues'>('overview');

  // Modals & Filters
  const [showWhereIssue, setShowWhereIssue] = useState<MeaningfulIssue | null>(null);
  const [focusedFixIssue, setFocusedFixIssue] = useState<MeaningfulIssue | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoutineChecks, setShowRoutineChecks] = useState(false);
  const [showTechnicalModal, setShowTechnicalModal] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Synchronize active audit to global assistant context
  useEffect(() => {
    if (auditData) {
      setActiveAudit(auditData);
    }
  }, [auditData, setActiveAudit]);

  const refreshHistoryCount = () => {
    const list = browserStorage.listAuditSessions();
    setHistoryCount(list.length);
  };

  useEffect(() => {
    refreshHistoryCount();
  }, []);

  // Run audit execution
  const runAudit = async (targetUrl: string, strat: 'mobile' | 'desktop', pSpeed: boolean) => {
    if (!targetUrl) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setCurrentUrl(targetUrl);
    setStrategy(strat);
    setIncludePagespeed(pSpeed);

    try {
      const result = await api.runAudit({
        url: targetUrl,
        strategy: strat,
        include_pagespeed: pSpeed,
      });

      setAuditData(result);
      setSavedTimestamp(Date.now());
      browserStorage.saveAuditSession(result);
      refreshHistoryCount();

      // Trigger background visual audit
      loadVisualAudit(targetUrl, strat);
    } catch (err: unknown) {
      if ((err as Error).name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'Failed to complete website audit');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Run visual audit capture
  const loadVisualAudit = async (targetUrl: string, strat: 'mobile' | 'desktop') => {
    setIsVisualLoading(true);
    try {
      const vis = await api.runVisualAudit({
        url: targetUrl,
        strategy: strat,
        findings: auditData?.findings as unknown as Record<string, unknown>[],
      });
      setVisualData(vis);
      if (auditData) {
        browserStorage.saveAuditSession(auditData, { visual: vis });
      }
    } catch (err) {
      console.warn('Visual audit capture failed', err);
    } finally {
      setIsVisualLoading(false);
    }
  };

  // Initial load via URL search params
  useEffect(() => {
    if (urlParam) {
      runAudit(urlParam, strategyParam, pagespeedParam);
    } else {
      const latest = browserStorage.getLatestAuditSession();
      if (latest && latest.audit) {
        setAuditData(latest.audit);
        setCurrentUrl(latest.audit.url);
        setStrategy(latest.audit.strategy || 'desktop');
        setSavedTimestamp(latest.timestamp);
        if (latest.visual) setVisualData(latest.visual);
        if (latest.reviewed_finding_ids) setFixedIssueIds(latest.reviewed_finding_ids);
        if (latest.prompt_draft) setPromptDraft(latest.prompt_draft);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Process findings through intelligence engine
  const intelligence = useMemo(() => {
    if (!auditData) return null;
    return processAuditIntelligence(auditData);
  }, [auditData]);

  // Section groups
  const sectionGroups = useMemo(() => {
    if (!intelligence) return [];
    return groupIssuesBySection([
      ...intelligence.fixFirst,
      ...intelligence.improveNext,
      ...intelligence.optional,
    ]);
  }, [intelligence]);

  // Handle toggling fixed issues
  const handleToggleFixed = (issueId: string) => {
    const updated = fixedIssueIds.includes(issueId)
      ? fixedIssueIds.filter((id) => id !== issueId)
      : [...fixedIssueIds, issueId];

    setFixedIssueIds(updated);
    if (auditData) {
      browserStorage.saveAuditSession(auditData, {
        visual: visualData,
        contentPlan,
        reviewedIds: updated,
        chatMessages,
        promptDraft,
      });
    }
  };

  // Open Canvas Inspector
  const handleOpenInspect = (issueId?: string, section?: PageSection) => {
    const params = new URLSearchParams({
      url: currentUrl,
      strategy,
      mode: 'original',
    });
    if (auditData?.audit_id) params.set('auditId', auditData.audit_id);
    if (issueId) params.set('issueId', issueId);
    if (section) params.set('section', section);

    router.push(`/audit/inspect?${params.toString()}`);
  };

  // Select historical audit
  const handleSelectAuditFromHistory = (auditOrId: string | { audit: AuditResponse }) => {
    if (typeof auditOrId === 'string') {
      const session = browserStorage.getAuditSession(auditOrId);
      if (session && session.audit) {
        setAuditData(session.audit);
        setCurrentUrl(session.audit.url);
        setStrategy(session.audit.strategy || 'desktop');
        setSavedTimestamp(session.timestamp);
        if (session.visual) setVisualData(session.visual);
        if (session.reviewed_finding_ids) setFixedIssueIds(session.reviewed_finding_ids);
        if (session.prompt_draft) setPromptDraft(session.prompt_draft);
      }
    } else if (auditOrId && auditOrId.audit) {
      setAuditData(auditOrId.audit);
      setCurrentUrl(auditOrId.audit.url);
      setStrategy(auditOrId.audit.strategy || 'desktop');
    }
    setIsHistoryOpen(false);
  };

  // Filter issues by search query
  const matchesSearch = (issue: MeaningfulIssue) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      issue.title.toLowerCase().includes(q) ||
      issue.problem.toLowerCase().includes(q) ||
      issue.whyItMatters.toLowerCase().includes(q) ||
      issue.category.toLowerCase().includes(q)
    );
  };

  // Export Executive Markdown Report
  const handleExportExecutiveReport = () => {
    if (!auditData || !intelligence) return;
    const markdown = `# WebLens AI Website Audit Report
Target: ${auditData.url}
Strategy: ${strategy.toUpperCase()}
Audit ID: ${auditData.audit_id}
Overall Assessment: ${intelligence.assessmentText}

## Core Web Vitals
- LCP: ${auditData.pagespeed?.metrics?.['largest-contentful-paint']?.display_value || 'N/A'}
- FCP: ${auditData.pagespeed?.metrics?.['first-contentful-paint']?.display_value || 'N/A'}
- CLS: ${auditData.pagespeed?.metrics?.['cumulative-layout-shift']?.display_value || 'N/A'}
- TBT: ${auditData.pagespeed?.metrics?.['total-blocking-time']?.display_value || 'N/A'}

## Prioritized Findings (${intelligence.totalIssuesCount} total)
### Fix First:
${intelligence.fixFirst.map((i, idx) => `${idx + 1}. **${i.title}** (${i.category})\n   - Problem: ${i.problem}\n   - Fix: ${i.recommendedFix}`).join('\n\n')}

### Improve Next:
${intelligence.improveNext.map((i, idx) => `${idx + 1}. **${i.title}** (${i.category})\n   - Problem: ${i.problem}\n   - Fix: ${i.recommendedFix}`).join('\n\n')}

---
Generated by WebLens AI · 100% Free Website Intelligence
`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `weblens-audit-${new URL(auditData.url).hostname}.md`;
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F8] selection:bg-[#F20D4F] selection:text-white flex flex-col select-none bg-tech-grid pt-16 sm:pt-20">
      {/* 1. Universal Interactive Audit Header */}
      <AuditHeader
        url={currentUrl}
        strategy={strategy}
        includePagespeed={includePagespeed}
        isLoading={isLoading}
        onAudit={runAudit}
        onOpenHistory={() => setIsHistoryOpen(true)}
        savedTimestamp={savedTimestamp}
        historyCount={historyCount}
      />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* State 1: Loading */}
        {isLoading && (
          <AuditLoadingState
            url={currentUrl}
            strategy={strategy}
            includePagespeed={includePagespeed}
          />
        )}

        {/* State 2: Error */}
        {error && !isLoading && (
          <AuditErrorState
            error={error}
            onRetry={() => runAudit(currentUrl, strategy, includePagespeed)}
            onRetryWithoutPagespeed={() => runAudit(currentUrl, strategy, false)}
            includePagespeed={includePagespeed}
          />
        )}

        {/* State 3: Empty State */}
        {!auditData && !isLoading && !error && (
          <div className="py-20 text-center max-w-xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#0B0B0D] border border-[rgba(242,13,79,0.35)] flex items-center justify-center mx-auto shadow-accent p-3">
              <img
                src="/favicon.png"
                alt="WebLens AI"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-3">
              <img
                src="/logo.png"
                alt="WebLens AI"
                className="h-10 w-auto object-contain mx-auto mb-3"
              />
              <h3 className="text-2xl font-black text-[#F7F7F8] tracking-tight">
                Enter a Website URL to Begin
              </h3>
              <p className="text-sm text-[#B4B4BD] leading-relaxed max-w-md mx-auto">
                WebLens will inspect your website DOM, capture precision screenshots, and identify exactly
                what to improve without technical jargon.
              </p>
            </div>

            <div className="pt-6 border-t border-[rgba(255,255,255,0.08)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#777781] block mb-3">
                Or try a test website
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { name: 'Example Domain', url: 'https://example.com/' },
                  { name: 'Python.org', url: 'https://www.python.org/' },
                  { name: 'Hacker News', url: 'https://news.ycombinator.com/' },
                ].map((demo) => (
                  <button
                    key={demo.url}
                    onClick={() => runAudit(demo.url, 'desktop', true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#111114] hover:bg-[#17171B] border border-[rgba(255,255,255,0.09)] text-[#F7F7F8] transition shadow-xs"
                  >
                    {demo.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State 4: Completed Audit Results */}
        {auditData && !isLoading && !error && intelligence && (
          <div className="space-y-6">
            {/* Top Workspace Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3 gap-4">
              <nav className="flex items-center gap-2 overflow-x-auto" aria-label="Main Navigation">
                <button
                  type="button"
                  onClick={() => setActiveArea('overview')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                    activeArea === 'overview'
                      ? 'bg-[#17171B] text-[#F7F7F8] border border-[rgba(255,255,255,0.12)] shadow-xs'
                      : 'bg-[#0B0B0D] text-[#777781] hover:text-[#F7F7F8] border border-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 ${activeArea === 'overview' ? 'text-[#F20D4F]' : ''}`} />
                  <span>Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveArea('issues')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                    activeArea === 'issues'
                      ? 'bg-[#17171B] text-[#F7F7F8] border border-[rgba(255,255,255,0.12)] shadow-xs'
                      : 'bg-[#0B0B0D] text-[#777781] hover:text-[#F7F7F8] border border-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 ${activeArea === 'issues' ? 'text-[#F20D4F]' : ''}`} />
                  <span>Issues to Fix</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                      activeArea === 'issues'
                        ? 'bg-[#F20D4F] text-white'
                        : 'bg-[#17171B] text-[#777781]'
                    }`}
                  >
                    {intelligence.totalIssuesCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveArea('prompts')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 ${
                    activeArea === 'prompts'
                      ? 'bg-[#17171B] text-[#F7F7F8] border border-[rgba(255,255,255,0.12)] shadow-xs'
                      : 'bg-[#0B0B0D] text-[#777781] hover:text-[#F7F7F8] border border-[rgba(255,255,255,0.06)]'
                  }`}
                >
                  <Terminal className={`w-4 h-4 ${activeArea === 'prompts' ? 'text-[#F20D4F]' : ''}`} />
                  <span>AI Agent Prompts</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      activeArea === 'prompts'
                        ? 'bg-[#F20D4F] text-white'
                        : 'bg-[rgba(242,13,79,0.15)] text-[#F20D4F]'
                    }`}
                  >
                    Bridge
                  </span>
                </button>
              </nav>

              <div className="flex items-center gap-2">
                {/* Launch Visual Studio */}
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams({
                      url: currentUrl,
                      auditId: auditData.audit_id,
                      strategy,
                      mode: 'vision_hub',
                    });
                    router.push(`/audit/inspect?${params.toString()}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs font-semibold shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                  <span>Launch Visual Studio</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportExecutiveReport}
                  className="inline-flex items-center gap-1.5 text-xs text-[#F7F7F8] hover:text-[#F20D4F] font-semibold py-1.5 px-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] hover:bg-[#111114] transition shadow-xs"
                  title="Download Executive Markdown Report"
                >
                  <Download className="w-3.5 h-3.5 text-[#F20D4F]" />
                  <span className="hidden sm:inline">Export Report</span>
                </button>

                {/* Technical Details Modal Trigger */}
                <button
                  type="button"
                  onClick={() => setShowTechnicalModal(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#777781] hover:text-[#F7F7F8] font-medium py-1.5 px-3 rounded-xl hover:bg-[#111114] transition"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#777781]" />
                  <span>Technical details</span>
                </button>
              </div>
            </div>

            {/* AREA 1: OVERVIEW */}
            {activeArea === 'overview' && (
              <div className="space-y-6">
                {/* Overall Assessment Banner */}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-6 sm:p-7 shadow-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#777781]">
                        Website Health Assessment
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#F7F7F8]">
                        {intelligence.assessmentText}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveArea('issues')}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs font-semibold shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] transition shrink-0"
                    >
                      <span>Review Issues to Fix</span>
                      <ArrowRight className="w-4 h-4 text-pink-200" />
                    </button>
                  </div>

                  <p className="text-sm text-[#B4B4BD] leading-relaxed font-normal">
                    {intelligence.recommendedNextStep}
                  </p>
                </div>

                {/* Master AI Agent Implementation Prompt Card */}
                <div className="rounded-2xl border border-[rgba(242,13,79,0.35)] bg-gradient-to-br from-[#0B0B0D] via-[#111114] to-[#0B0B0D] p-6 shadow-accent space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#17171B] border border-[rgba(242,13,79,0.3)] text-[#F20D4F] flex items-center justify-center shadow-xs">
                        <Terminal className="w-5 h-5 text-[#F20D4F]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#F7F7F8]">
                            Master Agent Implementation Prompt
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[rgba(242,13,79,0.15)] text-[#F20D4F] border border-[rgba(242,13,79,0.3)]">
                            Ready to Execute
                          </span>
                        </div>
                        <p className="text-xs text-[#B4B4BD]">
                          Copy this ready-to-paste instruction directly into Cursor, Claude Code, or Windsurf to resolve all prioritized issues.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const masterPrompt = `You are a Principal Frontend Engineer. WebLens AI audited: ${auditData.url} (${strategy} viewport).
Overall Assessment: ${intelligence.assessmentText}.
Key Objective: ${intelligence.recommendedNextStep}

PRIORITIZED ISSUES TO RESOLVE:
${intelligence.fixFirst
  .slice(0, 5)
  .map(
    (issue, idx) => `${idx + 1}. [${issue.category.toUpperCase()}] ${issue.title}
   Selector: \`${issue.selector || 'DOM'}\`
   Problem: ${issue.problem}
   Required Fix: ${issue.recommendedFix}`
  )
  .join('\n\n')}

CONSTRAINTS:
- Preserve all existing content, copy, state, and user flows 100%.
- Ensure WCAG AA contrast (minimum 4.5:1) and touch targets ≥48px.
- Zero horizontal layout shift (CLS < 0.1).
- Output clean, accessible React / Tailwind CSS code.`;
                          navigator.clipboard.writeText(masterPrompt);
                          setCopiedMasterPrompt(true);
                          setTimeout(() => setCopiedMasterPrompt(false), 2500);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs font-semibold shadow-xs transition"
                      >
                        {copiedMasterPrompt ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Prompt Copied!</span>
                          </>
                        ) : (
                          <>
                            <Terminal className="w-3.5 h-3.5 text-pink-200" />
                            <span>Copy Master Prompt</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveArea('prompts')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#17171B] hover:bg-[#222228] text-[#F7F7F8] text-xs font-semibold border border-[rgba(255,255,255,0.08)] shadow-xs transition"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#F20D4F]" />
                        <span>Open Prompt Bridge</span>
                      </button>
                    </div>
                  </div>

                  {/* Prompt Preview Snippet */}
                  <div className="relative rounded-xl bg-[#050505] text-[#B4B4BD] p-4 font-mono text-xs overflow-x-auto border border-[rgba(255,255,255,0.08)] max-h-36 overflow-y-auto leading-relaxed">
                    <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-[#B4B4BD]">
{`// WebLens AI Master Prompt · Target: ${auditData.url}
Fix ${intelligence.fixFirst.length} critical issues on ${strategy} viewport:
${intelligence.fixFirst.slice(0, 3).map((i) => `→ ${i.title} (${i.selector || 'component'})`).join('\n')}
...`}
                    </pre>
                  </div>
                </div>

                {/* Core Real Metrics Row */}
                {auditData.pagespeed?.metrics && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {['largest-contentful-paint', 'first-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time'].map(
                      (metricKey) => {
                        const m = auditData.pagespeed?.metrics?.[metricKey];
                        if (!m) return null;
                        return (
                          <div
                            key={metricKey}
                            className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-4 shadow-card space-y-1"
                          >
                            <span className="text-[11px] font-semibold text-[#777781] uppercase tracking-wide block">
                              {metricKey === 'largest-contentful-paint'
                                ? 'Main Load Speed (LCP)'
                                : metricKey === 'first-contentful-paint'
                                ? 'First Content (FCP)'
                                : metricKey === 'cumulative-layout-shift'
                                ? 'Visual Stability (CLS)'
                                : 'Input Delay (TBT)'}
                            </span>
                            <div className="text-2xl font-extrabold text-[#F7F7F8]">
                              {m.display_value || `${m.value}${m.unit || ''}`}
                            </div>
                            <span
                              className={`inline-block text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${
                                (m.score || 0) >= 0.9
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                  : (m.score || 0) >= 0.5
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                                  : 'bg-[rgba(242,13,79,0.15)] text-[#F20D4F] border border-[rgba(242,13,79,0.3)]'
                              }`}
                            >
                              {(m.score || 0) >= 0.9 ? 'Good' : (m.score || 0) >= 0.5 ? 'Needs Work' : 'Poor'}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}

                {/* Top 3 Highest Priority Issues */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-[#F7F7F8]">
                        Top Issues to Address First
                      </h3>
                      <p className="text-xs text-[#777781]">
                        Ranked by measured impact on visitor speed, accessibility, and clarity.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveArea('issues')}
                      className="text-xs font-semibold text-[#F20D4F] hover:text-[#FF245F]"
                    >
                      View all {intelligence.totalIssuesCount} &rarr;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {intelligence.top3Issues.map((issue) => (
                      <SimpleIssueCard
                        key={issue.id}
                        issue={issue}
                        isFixed={fixedIssueIds.includes(issue.id)}
                        onToggleFixed={handleToggleFixed}
                        onShowWhere={(i) => handleOpenInspect(i.id, i.pageSection)}
                        onHelpFix={(i) => setFocusedFixIssue(i)}
                      />
                    ))}
                  </div>
                </div>

                {/* Inspect by Website Section Breakdown */}
                {sectionGroups.length > 0 && (
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-5 sm:p-6 shadow-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#F7F7F8] flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#F20D4F]" />
                          <span>Inspect by Website Section</span>
                        </h3>
                        <p className="text-xs text-[#777781]">
                          Jump directly to any page section on your website to review issues in context.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenInspect()}
                        className="text-xs font-semibold text-[#F20D4F] hover:text-[#FF245F]"
                      >
                        Open Full Inspector &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {sectionGroups.map((g) => (
                        <button
                          key={g.section}
                          type="button"
                          onClick={() => handleOpenInspect(undefined, g.section)}
                          className="flex flex-col items-start p-3.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111114] hover:bg-[#17171B] hover:border-[#F20D4F] transition group text-left shadow-xs"
                        >
                          <span className="text-xs font-bold text-[#F7F7F8] group-hover:text-[#F20D4F] transition">
                            {g.label}
                          </span>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#777781] font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#F20D4F]" />
                            <span>
                              {g.issues.length} {g.issues.length === 1 ? 'finding' : 'findings'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AREA 2: AI AGENT PROMPTS & BRIDGES */}
            {activeArea === 'prompts' && (
              <div className="space-y-6">
                {/* Agent Execution Bridge: Cursor, Claude Code, Windsurf, Antigravity */}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-6 shadow-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#17171B] border border-[rgba(242,13,79,0.3)] text-[#F20D4F] flex items-center justify-center shadow-xs">
                        <Terminal className="w-5 h-5 text-[#F20D4F]" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#F7F7F8]">
                          AI Agent Execution Bridge
                        </h3>
                        <p className="text-xs text-[#777781]">
                          Bi-directional prompt bridge for Cursor Composer, Claude Code CLI, Windsurf, and Antigravity. WebLens gives suggestions, your agent executes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <AgentExecutionBridge
                    pageUrl={auditData.url}
                    issues={[
                      ...intelligence.fixFirst,
                      ...intelligence.improveNext,
                    ]}
                    onVerifyFix={(id) => {
                      if (!fixedIssueIds.includes(id)) {
                        setFixedIssueIds((prev) => [...prev, id]);
                      }
                    }}
                  />
                </div>

                {/* Full Customizable Agent Prompt Generator */}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-6 shadow-card space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F20D4F]" />
                    <h3 className="text-base font-bold text-[#F7F7F8]">
                      Custom Scope Prompt Generator
                    </h3>
                  </div>
                  <p className="text-xs text-[#777781]">
                    Target specific frameworks (Next.js, Vite React, Vue, HTML/CSS), customize prompt scope, and generate structured prompts with acceptance criteria.
                  </p>
                  <AgentPromptTab
                    pageUrl={auditData.url}
                    findings={auditData.findings || []}
                    pageSnapshot={auditData.page_snapshot}
                    initialFinding={null}
                    initialPromptDraft={promptDraft}
                    onPromptDraftChange={(draft) => {
                      setPromptDraft(draft);
                      if (auditData) {
                        browserStorage.saveAuditSession(auditData, {
                          visual: visualData,
                          contentPlan,
                          reviewedIds: fixedIssueIds,
                          chatMessages,
                          promptDraft: draft,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* AREA 3: ISSUES TO FIX */}
            {activeArea === 'issues' && (
              <div className="space-y-6">
                {/* Header Summary & Search */}
                <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-5 sm:p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-[#F7F7F8]">
                      Your website has {intelligence.totalIssuesCount} issues worth fixing.
                    </h2>
                    <p className="text-xs text-[#777781] mt-1">
                      Grouped into 3 understandable categories: Fix first, Improve next, and Optional.
                    </p>
                  </div>

                  {/* Search field */}
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#777781]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search issues..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111114] text-xs text-[#F7F7F8] placeholder:text-[#777781] focus:outline-none focus:ring-2 focus:ring-[#F20D4F]"
                    />
                  </div>
                </div>

                {/* Priority Group 1: Fix First */}
                {intelligence.fixFirst.filter(matchesSearch).length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-[#F20D4F]" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#F7F7F8]">
                        Fix First ({intelligence.fixFirst.filter(matchesSearch).length})
                      </h3>
                      <span className="text-xs text-[#777781]">— Important problems requiring immediate fix</span>
                    </div>

                    <div className="space-y-3">
                      {intelligence.fixFirst.filter(matchesSearch).map((issue) => (
                        <SimpleIssueCard
                          key={issue.id}
                          issue={issue}
                          isFixed={fixedIssueIds.includes(issue.id)}
                          onToggleFixed={handleToggleFixed}
                          onShowWhere={(i) => handleOpenInspect(i.id, i.pageSection)}
                          onHelpFix={(i) => setFocusedFixIssue(i)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Group 2: Improve Next */}
                {intelligence.improveNext.filter(matchesSearch).length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#F7F7F8]">
                        Improve Next ({intelligence.improveNext.filter(matchesSearch).length})
                      </h3>
                      <span className="text-xs text-[#777781]">— Meaningful usability & content improvements</span>
                    </div>

                    <div className="space-y-3">
                      {intelligence.improveNext.filter(matchesSearch).map((issue) => (
                        <SimpleIssueCard
                          key={issue.id}
                          issue={issue}
                          isFixed={fixedIssueIds.includes(issue.id)}
                          onToggleFixed={handleToggleFixed}
                          onShowWhere={(i) => handleOpenInspect(i.id, i.pageSection)}
                          onHelpFix={(i) => setFocusedFixIssue(i)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Priority Group 3: Optional Suggestions */}
                {intelligence.optional.filter(matchesSearch).length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-[#777781]" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#F7F7F8]">
                        Optional Suggestions ({intelligence.optional.filter(matchesSearch).length})
                      </h3>
                      <span className="text-xs text-[#777781]">— Useful refinements that are not essential</span>
                    </div>

                    <div className="space-y-3">
                      {intelligence.optional.filter(matchesSearch).map((issue) => (
                        <SimpleIssueCard
                          key={issue.id}
                          issue={issue}
                          isFixed={fixedIssueIds.includes(issue.id)}
                          onToggleFixed={handleToggleFixed}
                          onShowWhere={(i) => handleOpenInspect(i.id, i.pageSection)}
                          onHelpFix={(i) => setFocusedFixIssue(i)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Collapsible Routine Technical Checks */}
                {intelligence.routineChecks.length > 0 && (
                  <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
                    <button
                      type="button"
                      onClick={() => setShowRoutineChecks(!showRoutineChecks)}
                      className="flex items-center justify-between w-full p-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] text-left text-xs font-semibold text-[#B4B4BD] hover:bg-[#111114] transition"
                    >
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[#777781]" />
                        <span>Routine Technical Checks ({intelligence.routineChecks.length})</span>
                        <span className="text-[#777781] font-normal">
                          — Minor markup conventions and optional metadata
                        </span>
                      </div>
                      {showRoutineChecks ? (
                        <ChevronUp className="w-4 h-4 text-[#777781]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#777781]" />
                      )}
                    </button>

                    {showRoutineChecks && (
                      <div className="mt-3 space-y-2 animate-fade-in">
                        {intelligence.routineChecks.map((issue) => (
                          <div
                            key={issue.id}
                            className="p-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111114] text-xs space-y-1"
                          >
                            <div className="font-semibold text-[#F7F7F8]">{issue.title}</div>
                            <p className="text-[#777781]">{issue.problem}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Show Me Where Visual Modal */}
      {showWhereIssue && (
        <ShowWhereModal
          issue={showWhereIssue}
          visual={visualData}
          onClose={() => setShowWhereIssue(null)}
          onHelpFix={(i) => {
            setShowWhereIssue(null);
            setFocusedFixIssue(i);
          }}
          onOpenInspect={(i) => {
            setShowWhereIssue(null);
            handleOpenInspect(i.id, i.pageSection);
          }}
        />
      )}

      {/* Help Me Fix It Modal */}
      {focusedFixIssue && (
        <FocusedFixModal
          issue={focusedFixIssue}
          onClose={() => setFocusedFixIssue(null)}
          onShowWhere={(i) => {
            setFocusedFixIssue(null);
            handleOpenInspect(i.id, i.pageSection);
          }}
        />
      )}

      {/* Technical Details Modal */}
      {showTechnicalModal && auditData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#0B0B0D] shadow-dropdown p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
              <h3 className="text-base font-bold text-[#F7F7F8] flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#F20D4F]" />
                Raw Technical Details &amp; Diagnostics
              </h3>
              <button
                type="button"
                onClick={() => setShowTechnicalModal(false)}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#17171B] hover:bg-[#222228] text-[#F7F7F8] border border-[rgba(255,255,255,0.08)] transition"
              >
                Close
              </button>
            </div>
            <TechnicalDetailsTab
              pageSnapshot={auditData.page_snapshot}
              pagespeed={auditData.pagespeed}
            />
          </div>
        </div>
      )}

      {/* Audit History Drawer */}
      <AuditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => {
          setIsHistoryOpen(false);
          refreshHistoryCount();
        }}
        onSelectAudit={handleSelectAuditFromHistory}
        currentAuditId={auditData?.audit_id}
      />
    </div>
  );
}

export default function AuditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <div className="flex items-center gap-3 text-[#B4B4BD] text-sm font-medium">
            <div className="w-4 h-4 border-2 border-[#F20D4F] border-t-transparent rounded-full animate-spin" />
            <span>Loading WebLens Workspace...</span>
          </div>
        </div>
      }
    >
      <AuditWorkspaceContent />
    </Suspense>
  );
}
