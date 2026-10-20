'use strict';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  Sparkles,
  FileCode,
  Layers,
  Filter,
  CheckSquare,
  Square,
  ExternalLink,
} from 'lucide-react';
import {
  buildImplementationPrompt,
  type CompleteRedesignModel,
} from '@/services/redesign';
import type { MeaningfulIssue } from '@/services/intelligence';

interface ImplementationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  strategy: 'mobile' | 'desktop';
  redesign: CompleteRedesignModel;
  allIssues: MeaningfulIssue[];
}

export function ImplementationPromptModal({
  isOpen,
  onClose,
  url,
  strategy,
  redesign,
  allIssues,
}: ImplementationPromptModalProps) {
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>(
    allIssues.map((i) => i.id)
  );
  const [promptText, setPromptText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  // Filter selected issues
  const selectedIssues = useMemo(() => {
    return allIssues.filter((i) => selectedIssueIds.includes(i.id));
  }, [allIssues, selectedIssueIds]);

  // Generate initial prompt when opened or selected issues change
  useEffect(() => {
    if (isOpen) {
      const generated = buildImplementationPrompt({
        url,
        strategy,
        redesign,
        selectedIssues,
      });
      setPromptText(generated);
    }
  }, [isOpen, url, strategy, redesign, selectedIssues]);

  if (!isOpen) return null;

  const handleToggleIssue = (id: string) => {
    if (selectedIssueIds.includes(id)) {
      setSelectedIssueIds(selectedIssueIds.filter((item) => item !== id));
    } else {
      setSelectedIssueIds([...selectedIssueIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIssueIds.length === allIssues.length) {
      setSelectedIssueIds([]);
    } else {
      setSelectedIssueIds(allIssues.map((i) => i.id));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const regenerated = buildImplementationPrompt({
        url,
        strategy,
        redesign,
        selectedIssues,
      });
      setPromptText(regenerated);
      setIsRegenerating(false);
    }, 200);
  };

  const isFullPage = selectedIssueIds.length === allIssues.length || selectedIssueIds.length > 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink/40 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="w-full max-w-5xl rounded-section border border-stroke-subtle bg-surface shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-ink"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stroke-subtle bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-control bg-accent-tint border border-stroke-subtle flex items-center justify-center text-accent">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="prompt-modal-title" className="text-base font-bold text-ink">
                  AI Coding Agent Implementation Prompt
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-tint text-accent border border-stroke-subtle">
                  {isFullPage ? 'Full-Page Redesign' : 'Section Improvements'}
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Ready to paste into Antigravity, Claude Code, or Cursor to implement this approved proposal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-control text-ink-muted hover:text-ink hover:bg-canvas transition"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split between Issue Selector (left) and Editable Prompt (right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Findings Filter Checklist */}
          <div className="lg:col-span-4 border-r border-stroke-subtle p-4 overflow-y-auto space-y-4 bg-canvas/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Findings to Include</span>
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-semibold text-accent hover:text-accent-hover transition"
              >
                {selectedIssueIds.length === allIssues.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <p className="text-xs text-ink-secondary">
              Select which issues should be addressed by the coding agent in this task.
            </p>

            <div className="space-y-2">
              {allIssues.map((issue) => {
                const isChecked = selectedIssueIds.includes(issue.id);
                return (
                  <div
                    key={issue.id}
                    onClick={() => handleToggleIssue(issue.id)}
                    className={`p-2.5 rounded-control border text-xs cursor-pointer transition flex items-start gap-2.5 ${
                      isChecked
                        ? 'border-accent bg-accent-tint/60 text-ink'
                        : 'border-stroke-subtle bg-surface text-ink-secondary hover:bg-canvas/50'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0 text-accent">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-accent" />
                      ) : (
                        <Square className="w-4 h-4 text-ink-muted" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-semibold text-ink leading-snug">
                        {issue.title}
                      </div>
                      <div className="text-[10px] text-ink-muted uppercase tracking-wider font-mono">
                        {issue.category} &bull; {issue.priority.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Editable Prompt Text Area */}
          <div className="lg:col-span-8 flex flex-col p-4 space-y-3 bg-surface overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-accent" />
                <span>Generated Prompt Specification</span>
              </span>

              <span className="text-[11px] text-ink-muted font-mono">
                {promptText.length} characters
              </span>
            </div>

            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="flex-1 w-full bg-[#101114] border border-stroke rounded-control p-4 font-mono text-xs text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-y-auto"
              placeholder="Implementation prompt..."
              spellCheck={false}
            />

            <p className="text-[11px] text-ink-secondary">
              Feel free to edit or add additional repository-specific context before handing this to your agent.
            </p>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 border-t border-stroke-subtle bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control border border-stroke-subtle bg-canvas hover:bg-stroke-subtle text-xs font-semibold text-ink transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Prompt</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-control text-xs font-semibold text-ink-secondary hover:text-ink transition"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-control bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-xs transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Implementation Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
