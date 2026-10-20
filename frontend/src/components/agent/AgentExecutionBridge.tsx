'use strict';

import React, { useState } from 'react';
import {
  Cpu,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  CheckSquare,
} from 'lucide-react';
import type { MeaningfulIssue } from '@/services/intelligence';

interface AgentExecutionBridgeProps {
  pageUrl: string;
  issues: MeaningfulIssue[];
  activeIssueId?: string | null;
  onSelectIssue?: (issueId: string) => void;
  onVerifyFix?: (issueId: string) => void;
}

export function AgentExecutionBridge({
  pageUrl,
  issues = [],
  activeIssueId,
  onSelectIssue,
  onVerifyFix,
}: AgentExecutionBridgeProps) {
  const [selectedAgent, setSelectedAgent] = useState<'cursor' | 'claude_code' | 'windsurf' | 'antigravity'>('cursor');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [executedIds, setExecutedIds] = useState<Record<string, boolean>>({});
  const [isVerifying, setIsVerifying] = useState<string | null>(null);

  const activeIssue = issues.find((i) => i.id === activeIssueId) || issues[0] || null;

  const agentTemplates = {
    cursor: {
      name: 'Cursor Composer',
      badge: 'IDE Agent',
      icon: '💻',
      buildCommand: (issue: MeaningfulIssue) =>
        `@WebLensAI Fix "${issue.title}" on ${pageUrl}
Selector: \`${issue.selector || 'body'}\`
Problem: ${issue.problem}
Required Fix: ${issue.recommendedFix}
Constraint: Preserve existing React state, routing, and data fetching 100%. Ensure WCAG AA compliance and zero horizontal overflow.`,
    },
    claude_code: {
      name: 'Claude Code CLI',
      badge: 'Terminal Agent',
      icon: '⚡',
      buildCommand: (issue: MeaningfulIssue) =>
        `claude -p "WebLensAI detected issue: ${issue.title}. Target element: ${issue.selector || 'DOM'}. Apply fix: ${issue.recommendedFix}. Run tests and verify."`,
    },
    windsurf: {
      name: 'Windsurf Cascade',
      badge: 'Cascade Agent',
      icon: '🌊',
      buildCommand: (issue: MeaningfulIssue) =>
        `Cascade: Refactor \`${issue.selector || 'component'}\` to address WebLensAI audit: ${issue.problem}. Recommended change: ${issue.recommendedFix}.`,
    },
    antigravity: {
      name: 'Antigravity Agent',
      badge: 'Deep Coding Agent',
      icon: '🚀',
      buildCommand: (issue: MeaningfulIssue) =>
        `Objective: Resolve WebLensAI finding "${issue.title}".
URL: ${pageUrl}
Target: \`${issue.selector || 'target element'}\`
Fix: ${issue.recommendedFix}
Acceptance Criteria:
- Verify element renders cleanly with accessible contrast (≥4.5:1).
- Confirm tap targets ≥48px.
- Build passes without TypeScript or linting warnings.`,
    },
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleExecute = (id: string) => {
    setIsVerifying(id);
    setTimeout(() => {
      setExecutedIds((prev) => ({ ...prev, [id]: true }));
      setIsVerifying(null);
      if (onVerifyFix) onVerifyFix(id);
    }, 1200);
  };

  return (
    <div className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] p-5 sm:p-6 shadow-card space-y-5 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(255,255,255,0.06)] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(242,13,79,0.12)] border border-[rgba(242,13,79,0.3)] text-[#F20D4F] text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Agent-to-Agent Execution Bridge</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#F7F7F8]">
            WebLens AI Suggests → Your AI Agent Executes
          </h3>
          <p className="text-xs text-[#777781] max-w-xl">
            WebLens AI acts as your expert design and audit advisor. Select any detected issue to generate a tailored command packet for your coding agent to implement in your codebase.
          </p>
        </div>

        {/* Agent Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#111114] border border-[rgba(255,255,255,0.08)] p-1 rounded-xl">
          {(['cursor', 'claude_code', 'windsurf', 'antigravity'] as const).map((agentKey) => {
            const spec = agentTemplates[agentKey];
            const isSelected = selectedAgent === agentKey;
            return (
              <button
                key={agentKey}
                type="button"
                onClick={() => setSelectedAgent(agentKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-[#17171B] text-[#F7F7F8] border border-[rgba(255,255,255,0.12)] shadow-xs'
                    : 'text-[#777781] hover:text-[#F7F7F8]'
                }`}
              >
                <span>{spec.icon}</span>
                <span>{spec.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Bridge Layout: Issues List (Left) and Execution Packet (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Suggestions List (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-bold text-[#777781] uppercase tracking-wider block">
            WebLens AI Suggestions ({issues.length})
          </span>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {issues.length === 0 ? (
              <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111114] text-xs text-[#777781] text-center">
                No active issues. Everything passes!
              </div>
            ) : (
              issues.map((issue) => {
                const isSelected = activeIssue?.id === issue.id;
                const isDone = executedIds[issue.id];
                return (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue && onSelectIssue(issue.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'border-[#F20D4F] bg-[rgba(242,13,79,0.15)] ring-2 ring-[#F20D4F]/30 shadow-xs'
                        : 'border-[rgba(255,255,255,0.06)] bg-[#111114] hover:bg-[#17171B]'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#777781] uppercase tracking-wider">
                          [{issue.category}]
                        </span>
                        {isDone && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            <Check className="w-2.5 h-2.5" /> Executed
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#F7F7F8] truncate">
                        {issue.title}
                      </h4>
                      <p className="text-[11px] text-[#777781] line-clamp-1">
                        {issue.recommendedFix}
                      </p>
                    </div>
                    <ArrowRight className={`w-4 h-4 shrink-0 mt-2 ${isSelected ? 'text-[#F20D4F]' : 'text-[#777781]'}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Suggestion & Agent Execution Command (7 cols) */}
        {activeIssue && (
          <div className="lg:col-span-7 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111114] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#F20D4F] uppercase tracking-wider">
                  Target for {agentTemplates[selectedAgent].name}
                </span>
                <h4 className="text-sm font-bold text-[#F7F7F8] mt-0.5">
                  {activeIssue.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      agentTemplates[selectedAgent].buildCommand(activeIssue),
                      activeIssue.id
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F20D4F] text-white text-xs font-bold hover:bg-[#FF245F] transition shadow-xs"
                >
                  {copiedId === activeIssue.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-pink-200" />
                      <span>Copy Agent Command</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleExecute(activeIssue.id)}
                  disabled={isVerifying === activeIssue.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition shadow-xs disabled:opacity-50"
                >
                  {isVerifying === activeIssue.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : executedIds[activeIssue.id] ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Fix</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Mark Executed</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Diagnostic Details */}
            <div className="space-y-1.5 text-xs text-[#B4B4BD] bg-[#050505] p-3 rounded-lg border border-[rgba(255,255,255,0.06)]">
              <div>
                <span className="font-bold text-[#F7F7F8]">Why it matters: </span>
                <span>{activeIssue.whyItMatters}</span>
              </div>
              {activeIssue.selector && (
                <div>
                  <span className="font-bold text-[#F7F7F8]">DOM Selector: </span>
                  <code className="bg-[#17171B] text-[#F20D4F] px-1.5 py-0.5 rounded font-mono text-[11px] border border-[rgba(242,13,79,0.2)]">
                    {activeIssue.selector}
                  </code>
                </div>
              )}
              <div>
                <span className="font-bold text-[#F7F7F8]">Recommended Fix: </span>
                <span className="text-emerald-400 font-medium">{activeIssue.recommendedFix}</span>
              </div>
            </div>

            {/* Exact Agent Command Preview */}
            <div className="relative rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#050505] p-3 font-mono text-xs text-[#B4B4BD] max-h-[180px] overflow-y-auto leading-relaxed">
              <pre className="whitespace-pre-wrap">
                {agentTemplates[selectedAgent].buildCommand(activeIssue)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
