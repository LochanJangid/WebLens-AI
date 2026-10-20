'use strict';

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ChatMessage, AuditResponse, Finding } from '@/types/api';
import { api } from '@/services/api';
import { browserStorage } from '@/services/storage';

interface AssistantContextType {
  isOpen: boolean;
  isSending: boolean;
  messages: ChatMessage[];
  activeUrl: string;
  activeAudit: AuditResponse | null;
  toggleAssistant: () => void;
  openAssistant: (initialQuestion?: string) => void;
  closeAssistant: () => void;
  sendMessage: (questionText: string) => Promise<void>;
  clearHistory: () => void;
  setActiveAudit: (audit: AuditResponse | null) => void;
  setActiveUrl: (url: string) => void;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hello! I am your WebLensAI Design & Engineering Assistant. I can help you improve your website’s visual hierarchy, fix contrast issues, elevate Core Web Vitals, or write precision AI agent prompts. Ask me anything or audit a website to get started!',
  timestamp: 'Just now',
};

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeUrl, setActiveUrlState] = useState<string>('');
  const [activeAudit, setActiveAuditState] = useState<AuditResponse | null>(null);

  // Hydrate messages from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('weblensai_assistant_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to parse saved assistant messages', e);
      }
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  // Sync recent audit from browser storage if activeAudit not set yet
  useEffect(() => {
    if (!activeAudit && typeof window !== 'undefined') {
      try {
        const recent = browserStorage.getRecentAudits();
        if (recent.length > 0) {
          const session = browserStorage.getAuditSession(recent[0].audit_id);
          if (session && session.audit) {
            setActiveAuditState(session.audit);
            setActiveUrlState(session.url);
          }
        }
      } catch (e) {
        console.warn('Storage read warning', e);
      }
    }
  }, [activeAudit]);

  // Persist messages whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        localStorage.setItem('weblensai_assistant_history', JSON.stringify(messages));
      } catch (e) {
        console.warn('Failed to save assistant history', e);
      }
    }
  }, [messages]);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setActiveAudit = useCallback((audit: AuditResponse | null) => {
    setActiveAuditState(audit);
    if (audit?.url) {
      setActiveUrlState(audit.url);
    }
  }, []);

  const setActiveUrl = useCallback((url: string) => {
    setActiveUrlState(url);
  }, []);

  const clearHistory = useCallback(() => {
    const fresh = [DEFAULT_WELCOME_MESSAGE];
    setMessages(fresh);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('weblensai_assistant_history', JSON.stringify(fresh));
      } catch (e) {
        console.warn('Failed to clear assistant history', e);
      }
    }
  }, []);

  const sendMessage = useCallback(
    async (questionText: string) => {
      const q = questionText.trim();
      if (!q || isSending) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: q,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);

      const targetUrl = activeUrl || activeAudit?.url || 'https://weblensai.com';
      const findingsList: Finding[] = activeAudit?.findings || [];

      // Lean context to conserve token budget
      const auditContext = {
        url: targetUrl,
        title: activeAudit?.page_snapshot?.title || 'WebLensAI Audited Page',
        findings_count: findingsList.length,
        top_findings: findingsList.slice(0, 5).map((f) => ({
          title: f.title,
          severity: f.severity,
          category: f.category,
          suggested_change: f.suggested_change,
          selector: f.evidence?.selector,
        })),
      };

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
          website_url: targetUrl,
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
            'I experienced a connection issue reaching the backend assistant. You can check the Audit Workspace to review all findings directly.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsSending(false);
      }
    },
    [activeUrl, activeAudit, messages, isSending]
  );

  const openAssistant = useCallback(
    (initialQuestion?: string) => {
      setIsOpen(true);
      if (initialQuestion) {
        setTimeout(() => {
          sendMessage(initialQuestion);
        }, 100);
      }
    },
    [sendMessage]
  );

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        isSending,
        messages,
        activeUrl,
        activeAudit,
        toggleAssistant,
        openAssistant,
        closeAssistant,
        sendMessage,
        clearHistory,
        setActiveAudit,
        setActiveUrl,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}
