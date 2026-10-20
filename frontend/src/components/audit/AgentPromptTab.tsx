'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Code,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCode,
  Save,
} from 'lucide-react';
import { AgentPromptResponse, Finding, PageSnapshot } from '@/types/api';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

interface AgentPromptTabProps {
  pageUrl: string;
  findings: Finding[];
  pageSnapshot: PageSnapshot;
  initialFinding?: Finding | null;
  initialPromptDraft?: string;
  onPromptDraftChange?: (draft: string) => void;
}

export type PromptScope = 'single_element' | 'single_page' | 'whole_website';

export function AgentPromptTab({
  pageUrl,
  findings = [],
  pageSnapshot,
  initialFinding,
  initialPromptDraft,
  onPromptDraftChange,
}: AgentPromptTabProps) {
  const findingsList = useMemo(() => (Array.isArray(findings) ? findings : []), [findings]);

  const [scope, setScope] = useState<PromptScope>(
    initialFinding ? 'single_element' : 'single_page'
  );
  const [selectedFindingId, setSelectedFindingId] = useState<string>(
    initialFinding?.id || findingsList[0]?.id || ''
  );
  const [framework, setFramework] = useState<string>('framework_neutral');
  const [objective, setObjective] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promptResult, setPromptResult] = useState<AgentPromptResponse | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string>(initialPromptDraft || '');
  const [copied, setCopied] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Update selected finding if initialFinding changes
  useEffect(() => {
    if (initialFinding) {
      setScope('single_element');
      setSelectedFindingId(initialFinding.id);
    }
  }, [initialFinding]);

  // Synchronize default objective when scope or selected finding changes
  useEffect(() => {
    if (scope === 'single_element') {
      const finding = findingsList.find((f) => f.id === selectedFindingId);
      if (finding) {
        setObjective(`Fix ${finding.title.toLowerCase()} on ${finding.evidence?.selector || 'the affected element'}`);
      } else {
        setObjective('Improve the specific element identified in the audit finding');
      }
    } else if (scope === 'single_page') {
      setObjective(
        `Improve the usability, accessibility, SEO, and performance of this page (${pageSnapshot?.title || pageUrl})`
      );
    } else {
      setObjective(
        'Implement a coordinated improvement plan addressing verified audit defects and web standards'
      );
    }
  }, [scope, selectedFindingId, findingsList, pageSnapshot, pageUrl]);

  // Debounced auto-save for prompt draft
  useEffect(() => {
    if (!editedPrompt) return;
    const timer = setTimeout(() => {
      if (onPromptDraftChange) {
        onPromptDraftChange(editedPrompt);
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 1500);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [editedPrompt, onPromptDraftChange]);

  // Handle prompt generation
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    let targetFindings: Finding[] = [];
    if (scope === 'single_element') {
      const match = findingsList.find((f) => f.id === selectedFindingId);
      if (match) targetFindings = [match];
      else if (findingsList.length > 0) targetFindings = [findingsList[0]];
    } else if (scope === 'single_page') {
      targetFindings = findingsList.slice(0, 8); // Top findings for the page
    } else {
      targetFindings = findingsList; // Whole website findings
    }

    const frameworkVal = framework === 'framework_neutral' ? null : framework;

    try {
      const res = await api.generateAgentPrompt({
        website_url: pageUrl,
        objective: objective.trim() || 'Improve website usability and performance',
        framework: frameworkVal,
        findings: targetFindings as unknown as Record<string, unknown>[],
        page_snapshot: {
          title: pageSnapshot?.title,
          url: pageUrl,
          meta_description: pageSnapshot?.meta_description,
          headings: pageSnapshot?.headings,
          html_bytes: pageSnapshot?.html_bytes,
        },
      });

      setPromptResult(res);
      const newPrompt = res.prompt || '';
      setEditedPrompt(newPrompt);
      if (onPromptDraftChange) {
        onPromptDraftChange(newPrompt);
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message ||
          'Failed to generate prompt. Please check backend Groq API configuration.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Safe word and character counts without any undefined .length
  const charCount = typeof editedPrompt === 'string' ? editedPrompt.length : 0;
  const wordCount =
    typeof editedPrompt === 'string' && editedPrompt.trim().length > 0
      ? editedPrompt.trim().split(/\s+/).length
      : 0;

  const changesList = Array.isArray(promptResult?.changes) ? promptResult.changes : [];
  const criteriaList = Array.isArray(promptResult?.acceptance_criteria) ? promptResult.acceptance_criteria : [];
  const assumptionsList = Array.isArray(promptResult?.assumptions) ? promptResult.assumptions : [];

  return (
    <div className="space-y-6">
      {/* Configuration Header Card */}
      <div className="bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.08)] p-5 sm:p-6 shadow-card space-y-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F20D4F] shadow-[0_0_8px_rgba(242,13,79,0.8)]" />
            <h3 className="text-base font-bold text-[#F7F7F8] tracking-tight">
              AI Coding-Agent Prompt Studio
            </h3>
          </div>
          <p className="text-xs text-[#B4B4BD] mt-1.5 max-w-2xl leading-relaxed">
            Generate high-precision, ready-to-paste prompts tailored for AI coding agents (such as Antigravity, Cursor, Claude Code, or GitHub Copilot) grounded strictly in verified audit findings.
          </p>
        </div>

        {/* Scope Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#777781] uppercase tracking-wider block">
            1. Select Prompt Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'single_element',
                label: 'Single Element',
                desc: 'Target one specific heading, button, or selector',
                icon: Code,
              },
              {
                id: 'single_page',
                label: 'Single Page',
                desc: 'Improve this page layout, accessibility & SEO',
                icon: FileCode,
              },
              {
                id: 'whole_website',
                label: 'Whole Website',
                desc: 'Coordinated plan across all detected issues',
                icon: Globe,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = scope === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScope(item.id as PromptScope)}
                  className={cn(
                    'p-3.5 rounded-xl border text-left transition-all flex items-start gap-3',
                    isSelected
                      ? 'bg-[#17171B] text-[#F7F7F8] border-[#F20D4F] shadow-[0_0_14px_rgba(242,13,79,0.15)] ring-1 ring-[#F20D4F]/40'
                      : 'bg-[#111114] text-[#B4B4BD] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] hover:text-[#F7F7F8]'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 shrink-0 mt-0.5',
                      isSelected ? 'text-[#F20D4F]' : 'text-[#777781]'
                    )}
                  />
                  <div>
                    <div className="text-xs font-bold">{item.label}</div>
                    <div
                      className={cn(
                        'text-[11px] mt-0.5 leading-snug',
                        isSelected ? 'text-[#B4B4BD]' : 'text-[#777781]'
                      )}
                    >
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional Element Selector if Scope is Single Element */}
        {scope === 'single_element' && (
          <div className="space-y-1.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
            <label className="text-xs font-bold text-[#B4B4BD] block">
              Choose Target Element / Finding:
            </label>
            <select
              value={selectedFindingId}
              onChange={(e) => setSelectedFindingId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111114] font-medium text-[#F7F7F8] focus:bg-[#17171B] focus:outline-none focus:ring-1 focus:ring-[#F20D4F] focus:border-[#F20D4F]"
            >
              {findingsList.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.category.toUpperCase()}] {f.title} — {f.evidence?.selector || 'Page-level'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Framework & Objective Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div>
            <label className="text-xs font-bold text-[#B4B4BD] block mb-1">
              Target Framework / Stack:
            </label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111114] font-medium text-[#F7F7F8] focus:bg-[#17171B] focus:outline-none focus:ring-1 focus:ring-[#F20D4F] focus:border-[#F20D4F]"
            >
              <option value="framework_neutral">Framework-Neutral (Standard HTML/CSS)</option>
              <option value="Next.js App Router & React">Next.js (App Router) + React</option>
              <option value="React with Tailwind CSS">React + Tailwind CSS</option>
              <option value="WordPress Theme / Block Editor">WordPress</option>
              <option value="Static HTML5, CSS3, Vanilla JS">Vanilla HTML5 / CSS3</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-[#B4B4BD] block mb-1">
              Custom Prompt Objective (Editable):
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g., Fix missing H1 and improve hero section messaging"
              className="w-full px-3 py-2 text-xs rounded-xl border border-[rgba(255,255,255,0.1)] bg-[#111114] font-medium text-[#F7F7F8] focus:bg-[#17171B] focus:outline-none focus:ring-1 focus:ring-[#F20D4F] focus:border-[#F20D4F]"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <span className="text-xs text-[#777781] font-medium">
            Scope: <span className="font-bold text-[#F7F7F8] capitalize">{scope.replace('_', ' ')}</span> • Grounded in {findingsList.length} findings
          </span>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#F20D4F] hover:bg-[#FF245F] text-white transition-all shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Crafting AI Prompt...</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-pink-200" />
                <span>Generate Agent Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generated Prompt Panel or Active Draft Panel */}
      {(promptResult || editedPrompt.length > 0) && (
        <div className="bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-card overflow-hidden space-y-4">
          {/* Panel Header */}
          <div className="p-4 sm:p-5 bg-[#111114] border-b border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#F20D4F] font-mono">
                <Terminal className="w-4 h-4" />
                <span>READY-TO-PASTE AI PROMPT</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#F7F7F8] mt-1">
                {promptResult?.title || 'AI Implementation Prompt'}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {draftSaved && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mr-1">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#17171B] text-[#B4B4BD] hover:text-[#F7F7F8] hover:bg-[#222228] border border-[rgba(255,255,255,0.08)] transition-colors"
                title="Regenerate prompt with AI"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isGenerating && 'animate-spin')} />
                <span>Regenerate</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#F20D4F] hover:bg-[#FF245F] text-white transition-all shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prompt Editor & Character Count */}
          <div className="px-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#777781]">
              <span className="font-semibold text-[#B4B4BD]">
                Review or fine-tune prompt before pasting into your coding agent:
              </span>
              <span className="font-mono text-[11px] text-[#777781]">
                {charCount} characters • {wordCount} words
              </span>
            </div>

            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              rows={12}
              className="w-full p-4 rounded-xl font-mono text-xs text-[#F7F7F8] bg-[#050505] border border-[rgba(255,255,255,0.08)] focus:border-[#F20D4F] focus:outline-none focus:ring-1 focus:ring-[#F20D4F] leading-relaxed transition-all"
              aria-label="Editable generated coding agent prompt"
            />
          </div>

          {/* Structured Metadata Breakdown: Changes, Acceptance Criteria, Assumptions */}
          <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {changesList.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.06)]">
                <span className="font-bold text-[#F7F7F8] block mb-2">
                  Target Changes ({changesList.length})
                </span>
                <ul className="space-y-1.5 text-[#B4B4BD]">
                  {changesList.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#F20D4F] font-bold">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {criteriaList.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#0e1713] border border-emerald-500/20">
                <span className="font-bold text-emerald-400 block mb-2">
                  Acceptance Criteria ({criteriaList.length})
                </span>
                <ul className="space-y-1.5 text-emerald-300">
                  {criteriaList.map((ac, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{ac}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {assumptionsList.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.06)]">
                <span className="font-bold text-[#F7F7F8] block mb-2">
                  Assumptions &amp; Constraints
                </span>
                <ul className="space-y-1.5 text-[#B4B4BD]">
                  {assumptionsList.map((asmp, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#777781] font-bold">•</span>
                      <span>{asmp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#050505] border-t border-[rgba(255,255,255,0.06)] text-[11px] text-[#777781] text-center">
            Paste this prompt into Antigravity CLI, Antigravity IDE, Cursor, Claude Code, or any AI coding tool. WebLens advises and formats instructions; it never modifies your remote website or repository directly.
          </div>
        </div>
      )}
    </div>
  );
}
