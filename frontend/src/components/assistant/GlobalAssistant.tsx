'use strict';
/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  Trash2,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { useAssistant } from '@/context/AssistantContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function GlobalAssistant() {
  const pathname = usePathname();
  const {
    isOpen,
    isSending,
    messages,
    activeUrl,
    activeAudit,
    toggleAssistant,
    closeAssistant,
    sendMessage,
    clearHistory,
  } = useAssistant();

  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const q = input;
    setInput('');
    await sendMessage(q);
  };

  const starterChips = [
    'What should I fix first?',
    'How do I improve contrast & accessibility?',
    'Generate Cursor Composer prompt',
    'Explain Core Web Vitals (LCP, CLS, TBT)',
    'How does the 60-30-10 color rule work?',
  ];

  return (
    <>
      {/* 1. Floating Action Button on Every Page */}
      <div className="fixed bottom-6 right-6 z-40 select-none">
        <button
          type="button"
          onClick={toggleAssistant}
          className={cn(
            'flex items-center gap-2.5 px-4 py-3 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.8)] border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F20D4F]',
            isOpen
              ? 'bg-[#17171B] border-[rgba(242,13,79,0.5)] text-white scale-95'
              : 'bg-[#0B0B0D] border-[rgba(242,13,79,0.35)] hover:border-[#F20D4F] text-[#F7F7F8] hover:scale-105 active:scale-95 shadow-accent'
          )}
          aria-label="Toggle WebLens AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F20D4F] animate-pulse" />
          </div>
          <img
            src="/favicon.png"
            alt="AI"
            className="w-4 h-4 rounded-md object-contain shrink-0"
          />
          <span className="text-xs font-bold tracking-tight">WebLens AI Assistant</span>
          {messages.length > 1 && !isOpen && (
            <span className="w-5 h-5 rounded-full bg-[#F20D4F] text-white text-[10px] font-black flex items-center justify-center ml-1">
              {messages.length - 1}
            </span>
          )}
        </button>
      </div>

      {/* 2. Slide-out Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden flex justify-end select-none"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={closeAssistant}
          />

          {/* Drawer Window */}
          <div className="relative w-full max-w-md sm:max-w-lg bg-[#0B0B0D] h-full shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col border-l border-[rgba(255,255,255,0.08)] animate-slide-in-right z-10 text-[#F7F7F8]">
            {/* Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.08)] bg-[#0E0E12] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  src="/favicon.png"
                  alt="WebLens AI"
                  className="w-8 h-8 rounded-xl object-contain shadow-card border border-[rgba(255,255,255,0.09)] bg-[#17171B] shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#F7F7F8]">WebLens AI Assistant</h3>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                      100% Free
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#777781]">
                    <Globe className="w-3 h-3 text-[#F20D4F]" />
                    <span className="truncate max-w-[200px]">
                      {activeUrl || activeAudit?.url || 'Ready to assist'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="p-1.5 text-[#777781] hover:text-[#F20D4F] hover:bg-[#17171B] rounded-lg transition"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeAssistant}
                  className="p-1.5 text-[#777781] hover:text-[#F7F7F8] hover:bg-[#17171B] rounded-lg transition"
                  title="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Context Notice (When active audit is loaded) */}
            {activeAudit && (
              <div className="bg-[rgba(242,13,79,0.08)] border-b border-[rgba(242,13,79,0.2)] px-4 py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F20D4F]" />
                  <span className="text-[#F7F7F8] font-semibold text-[11px]">
                    Context Loaded: {activeAudit.findings?.length || 0} findings analyzed
                  </span>
                </div>
                <Link
                  href="/audit"
                  onClick={closeAssistant}
                  className="text-[11px] font-bold text-[#F20D4F] hover:text-[#FF245F] inline-flex items-center gap-1"
                >
                  <span>View Workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050505] bg-tech-grid">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col',
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#777781] font-medium">
                    {msg.role === 'user' ? (
                      <>
                        <span>You</span>
                        <User className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <img src="/favicon.png" alt="WebLens AI" className="w-3.5 h-3.5 rounded-xs object-contain" />
                        <span>WebLens AI</span>
                      </>
                    )}
                    <span>·</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={cn(
                      'rounded-2xl p-3.5 text-xs max-w-[85%] leading-relaxed shadow-card select-text',
                      msg.role === 'user'
                        ? 'bg-[#17171B] border border-[rgba(242,13,79,0.3)] text-[#F7F7F8] rounded-tr-xs'
                        : 'bg-[#0E0E12] text-[#F7F7F8] border border-[rgba(255,255,255,0.08)] rounded-tl-xs space-y-2.5'
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                    {/* Actionable Recommendations */}
                    {msg.recommended_actions && msg.recommended_actions.length > 0 && (
                      <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#777781] block">
                          Recommended Actions:
                        </span>
                        {msg.recommended_actions.map((act, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-1.5 text-[11px] text-[#B4B4BD] font-medium"
                          >
                            <span className="text-[#F20D4F] font-bold">→</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Copy action for assistant response */}
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <div className="flex items-center justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="inline-flex items-center gap-1 text-[10px] text-[#777781] hover:text-[#F20D4F] font-semibold transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Answer</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex items-start gap-2 text-xs text-[#B4B4BD]">
                  <div className="w-6 h-6 rounded-lg bg-[rgba(242,13,79,0.15)] text-[#F20D4F] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-[#111114] border border-[rgba(255,255,255,0.08)] p-3 rounded-2xl rounded-tl-xs shadow-xs space-y-1">
                    <p className="font-semibold text-[#F7F7F8]">Analyzing website architecture...</p>
                    <p className="text-[11px] text-[#777781]">Synthesizing WCAG &amp; Core Web Vitals recommendation</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Chips */}
            <div className="p-2 border-t border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-1.5 shrink-0">
              {starterChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(chip)}
                  disabled={isSending}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B4B4BD] hover:text-[#F7F7F8] bg-[#111114] hover:bg-[#17171B] border border-[rgba(255,255,255,0.08)] px-2.5 py-1 rounded-full transition shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3 text-[#F20D4F]" />
                  <span>{chip}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleFormSubmit}
              className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#0E0E12] flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask WebLens AI about your website..."
                disabled={isSending}
                className="flex-1 bg-[#111114] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2 text-xs text-[#F7F7F8] placeholder:text-[#777781] focus:outline-none focus:ring-2 focus:ring-[#F20D4F] transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="w-8 h-8 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition shrink-0"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
