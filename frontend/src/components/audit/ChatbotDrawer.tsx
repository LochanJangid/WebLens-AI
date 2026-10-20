'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Terminal,
  HelpCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  ShieldCheck,
} from 'lucide-react';
import { ChatMessage, Finding, PageSnapshot } from '@/types/api';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pageUrl: string;
  findings: Finding[];
  pageSnapshot: PageSnapshot;
  onSendToPromptStudio: (recommendationText: string) => void;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function ChatbotDrawer({
  isOpen,
  onClose,
  pageUrl,
  findings = [],
  pageSnapshot,
  onSendToPromptStudio,
  initialMessages,
  onMessagesChange,
}: ChatbotDrawerProps) {
  const findingsList = Array.isArray(findings) ? findings : [];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (Array.isArray(initialMessages) && initialMessages.length > 0) {
      return initialMessages;
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm your WebLens Website Improvement Assistant. I can help you understand the ${findingsList.length} findings for ${pageUrl}, prioritize fixes, or create prompts for AI coding agents. How can I help you?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Notify parent on message changes for browser storage persistence
  useEffect(() => {
    if (onMessagesChange && messages.length > 0) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  const starterQuestions = [
    'What should I fix first?',
    'Explain my biggest performance issue.',
    "How should I improve this page's hero section?",
    'Which content or pages might be missing?',
    'Create a prompt for my AI coding agent.',
  ];

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    // Build lean context to conserve token budget
    const auditContext = {
      url: pageUrl,
      title: pageSnapshot?.title,
      findings_count: findingsList.length,
      top_findings: findingsList.slice(0, 5).map((f) => ({
        title: f.title,
        severity: f.severity,
        category: f.category,
        suggested_change: f.suggested_change,
        selector: f.evidence?.selector,
      })),
    };

    // Format bounded history (last 6 turns)
    const conversationHistory = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const res = await api.chat({
        question: q,
        website_url: pageUrl,
        audit_context: auditContext,
        conversation_history: conversationHistory,
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        evidence_used: Array.isArray(res.evidence_used) ? res.evidence_used : [],
        recommended_actions: Array.isArray(res.recommended_actions) ? res.recommended_actions : [],
        follow_up_needed: res.follow_up_needed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          (err as Error).message ||
          'Sorry, I could not complete the chat request. Please make sure the backend is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-[#E8EAF0] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#E8EAF0] bg-[#101114] text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3165F5] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-1.5">
              <span>WebLens Assistant</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                Session Active
              </span>
            </h4>
            <p className="text-[11px] text-[#8E929D] truncate max-w-[260px]">
              Grounded in audit of {pageUrl}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Disclaimers Bar */}
      <div className="px-4 py-2 bg-[#FAFAFC] border-b border-[#E8EAF0] text-[11px] text-[#686B73] flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Grounded in actual DOM snapshot. Conversations are active during current session only.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-[#F1F2F4]/40">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const evidenceList = Array.isArray(m.evidence_used) ? m.evidence_used : [];
          const actionsList = Array.isArray(m.recommended_actions) ? m.recommended_actions : [];

          return (
            <div
              key={m.id}
              className={cn('flex gap-2.5', isUser ? 'justify-end' : 'justify-start')}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-[#101114] text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 shadow-xs">
                  W
                </div>
              )}

              <div
                className={cn(
                  'max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-xs',
                  isUser
                    ? 'bg-[#101114] text-white rounded-tr-none'
                    : 'bg-white border border-[#E8EAF0] text-[#101114] rounded-tl-none'
                )}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                {/* Evidence Used */}
                {evidenceList.length > 0 && (
                  <div className="pt-2 border-t border-[#E8EAF0] text-[11px]">
                    <span className="font-bold text-[#686B73] block mb-1">Evidence Used:</span>
                    <ul className="list-disc pl-3 text-[#686B73] space-y-0.5">
                      {evidenceList.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Actions */}
                {actionsList.length > 0 && (
                  <div className="pt-2 border-t border-[#E8EAF0] text-[11px]">
                    <span className="font-bold text-[#3165F5] block mb-1">Recommended Actions:</span>
                    <ul className="space-y-1 text-[#101114]">
                      {actionsList.map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-semibold text-[#3165F5] shrink-0">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow up needed */}
                {m.follow_up_needed && (
                  <div className="pt-1.5 text-[11px] text-[#8E929D] italic">
                    Verification: {m.follow_up_needed}
                  </div>
                )}

                {/* Actions on Assistant messages */}
                {!isUser && m.id !== 'welcome' && (
                  <div className="pt-2 flex items-center gap-2 border-t border-[#E8EAF0]">
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#686B73] hover:text-[#101114]"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSendToPromptStudio(
                          `Implement the following improvement recommended by WebLens assistant:\n\n${m.content}\n\nActions:\n${actionsList.join('\n')}`
                        );
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3165F5] hover:text-blue-800 ml-auto"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Send to AI Prompt Studio</span>
                    </button>
                  </div>
                )}

                <div
                  className={cn(
                    'text-[10px] text-right',
                    isUser ? 'text-slate-400' : 'text-[#8E929D]'
                  )}
                >
                  {m.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex gap-2.5 items-center text-[#686B73] text-xs pl-8">
            <div className="w-4 h-4 border-2 border-[#3165F5] border-t-transparent rounded-full animate-spin" />
            <span>Consulting audit context...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Suggestions Chips */}
      <div className="p-3 bg-[#FAFAFC] border-t border-[#E8EAF0]">
        <span className="text-[10px] font-bold text-[#8E929D] uppercase tracking-wider block mb-1.5">
          Suggested Questions
        </span>
        <div className="flex flex-wrap gap-1.5">
          {starterQuestions.map((q, i) => (
            <button
              key={i}
              type="button"
              disabled={isSending}
              onClick={() => handleSend(q)}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-white border border-[#E8EAF0] text-[#101114] hover:bg-slate-50 hover:border-slate-300 transition-colors text-left font-medium shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-[#E8EAF0] bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSending}
            placeholder="Ask about your audit findings or fixes..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#E8EAF0] bg-[#FAFAFC] text-[#101114] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3165F5]"
          />
          <button
            type="submit"
            disabled={isSending || !inputText.trim()}
            className="p-2.5 rounded-xl bg-[#101114] text-white hover:bg-black disabled:opacity-40 transition-colors shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
