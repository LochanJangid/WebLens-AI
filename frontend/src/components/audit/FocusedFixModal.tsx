'use strict';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  Copy,
  CheckCircle2,
  ArrowRight,
  Terminal,
  RefreshCw,
  Info,
  Code,
  FileSearch,
} from 'lucide-react';
import {
  type MeaningfulIssue,
  generateFindingFixPrompt,
} from '@/services/intelligence';

interface FocusedFixModalProps {
  issue: MeaningfulIssue | null;
  onClose: () => void;
  onShowWhere?: (issue: MeaningfulIssue) => void;
  auditUrl?: string;
}

export function FocusedFixModal({ issue, onClose, onShowWhere, auditUrl }: FocusedFixModalProps) {
  const [promptVariant, setPromptVariant] = useState<'standard' | 'focused'>('standard');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  if (!issue) return null;

  const url = auditUrl || issue.pageUrl || issue.originalFinding?.page_url || 'https://target-website.com';
  const severity = issue.severity || (issue.priority === 'fix_first' ? 'critical' : issue.priority === 'improve_next' ? 'medium' : 'low');

  // Generate dynamic prompt with current variant
  const currentPrompt = generateFindingFixPrompt({
    title: issue.title,
    category: issue.category,
    severity,
    auditUrl: url,
    problem: issue.problem,
    whyItMatters: issue.whyItMatters,
    recommendedFix: issue.recommendedFix,
    selector: issue.selector,
    elementText: issue.elementText,
    metricEvidence: issue.metricEvidence,
    originalFinding: issue.originalFinding,
    variant: promptVariant,
  });

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(currentPrompt);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = currentPrompt;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedPrompt(true);
      setCopyFeedback('Fix prompt copied to clipboard!');
      setTimeout(() => {
        setCopiedPrompt(false);
        setCopyFeedback(null);
      }, 2500);
    } catch {
      setCopyFeedback('Failed to auto-copy. Please select and copy text manually.');
      setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setPromptVariant((prev) => (prev === 'standard' ? 'focused' : 'standard'));
    setTimeout(() => {
      setIsRegenerating(false);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[#0B0B0D] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fix-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[rgba(255,255,255,0.08)] pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#F20D4F]/10 text-[#F20D4F] border border-[#F20D4F]/20">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#777781]">
                Actionable Fix Guide
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#17171B] text-[#B4B4BD] border border-[rgba(255,255,255,0.08)]">
                {issue.category}
              </span>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                  severity === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {severity}
              </span>
            </div>
            <h3 id="fix-modal-title" className="text-lg sm:text-xl font-bold text-[#F7F7F8] leading-snug">
              {issue.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-[#777781] hover:bg-[#17171B] hover:text-[#F7F7F8] transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Plain-Language Explanation */}
        <div className="space-y-1.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#111114] p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#777781] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#F20D4F]" />
            What is happening
          </h4>
          <p className="text-sm text-[#F7F7F8] leading-relaxed font-normal">
            {issue.problem}
          </p>
          <p className="text-xs text-[#B4B4BD] leading-relaxed pt-1 border-t border-[rgba(255,255,255,0.06)]">
            <span className="text-[#F20D4F] font-semibold">Why it matters:</span> {issue.whyItMatters}
          </p>
        </div>

        {/* 2. Recommended Change */}
        <div className="rounded-xl border border-emerald-500/30 bg-[#0e1713] p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Recommended Change</span>
          </div>
          <p className="text-xs text-emerald-200 leading-relaxed font-medium">
            {issue.recommendedFix}
          </p>
        </div>

        {/* 3. Verified Audit Evidence */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#070709] p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#777781] font-semibold uppercase tracking-wider text-[11px]">
            <span className="flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-[#B4B4BD]" />
              Verified Audit Evidence
            </span>
            <span className="text-[10px] text-[#777781] lowercase">{url}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="space-y-0.5">
              <span className="text-[#777781]">Target Selector:</span>
              <p className="font-mono text-[#F7F7F8] break-all">
                {issue.selector ? (
                  <code className="text-[#F20D4F]">{issue.selector}</code>
                ) : (
                  <span className="text-[#B4B4BD] italic">Page-level / bundle finding (no selector isolated)</span>
                )}
              </p>
            </div>
            {issue.metricEvidence && (
              <div className="space-y-0.5">
                <span className="text-[#777781]">Metric Measurement:</span>
                <p className="font-mono text-[#F7F7F8]">
                  {issue.metricEvidence.name}: <span className="font-bold text-emerald-400">{issue.metricEvidence.value}</span> ({issue.metricEvidence.status})
                </p>
              </div>
            )}
          </div>
          {!issue.selector && (
            <p className="text-[11px] text-[#777781] italic border-t border-[rgba(255,255,255,0.05)] pt-1.5">
              Note: This finding affects repository build settings, site metadata, or page templates. Coding assistants are instructed to inspect source files rather than assume an arbitrary selector.
            </p>
          )}
        </div>

        {/* 4. Proposed Content Replacement if available */}
        {issue.elementText && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#777781]">
              Content Replacement
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 space-y-1">
                <span className="font-semibold text-rose-300">Current Text:</span>
                <p className="font-mono text-[#F7F7F8] break-all">&ldquo;{issue.elementText}&rdquo;</p>
              </div>
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 space-y-1">
                <span className="font-semibold text-emerald-300">Proposed Better Text:</span>
                <p className="font-medium text-emerald-200 leading-relaxed">
                  Clear, descriptive destination or value proposition.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 5. AI Fix Prompt Section */}
        <div className="space-y-2.5 pt-2 border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#F20D4F]" />
                <h4 className="text-sm font-bold text-[#F7F7F8]">AI Fix Prompt</h4>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#17171B] text-[#B4B4BD] border border-[rgba(255,255,255,0.08)]">
                  {promptVariant === 'standard' ? 'Comprehensive' : 'Focused Action'}
                </span>
              </div>
              <p className="text-xs text-[#777781]">
                Copy this prompt into your coding assistant to fix the issue in your project.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#141418] hover:bg-[#1C1C22] text-[#B4B4BD] hover:text-[#F7F7F8] text-xs font-semibold transition"
                title="Toggle between comprehensive and focused prompt formats"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-[#F20D4F]' : ''}`} />
                <span>Regenerate Prompt</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs font-semibold shadow-[0_0_12px_-2px_rgba(242,13,79,0.5)] transition"
              >
                {copiedPrompt ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Prompt Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Fix Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dark code-style container */}
          <div className="relative">
            <pre className="max-h-72 overflow-y-auto rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#050505] p-4 font-mono text-xs text-[#E1E1E6] whitespace-pre-wrap leading-relaxed select-all">
              {currentPrompt}
            </pre>
            {copyFeedback && (
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-medium backdrop-blur-sm shadow-lg animate-fade-in">
                {copyFeedback}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[rgba(255,255,255,0.08)]">
          {onShowWhere && issue.selector ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onShowWhere(issue);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B4B4BD] hover:text-[#F20D4F] transition"
            >
              <span>View element on screenshot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-xs text-[#777781] italic">
              Ready for Cursor, Windsurf, Claude Code, or Antigravity CLI
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#17171B] hover:bg-[#202026] text-[#F7F7F8] text-xs font-semibold transition"
            >
              {copiedPrompt ? 'Copied' : 'Copy Fix Prompt'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs font-semibold shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
