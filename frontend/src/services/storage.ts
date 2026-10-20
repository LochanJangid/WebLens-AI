import type {
  AuditResponse,
  ContentPlanResponse,
  ChatMessage,
  Finding,
  VisualAuditResponse,
  ScreenshotImproveResponse,
} from '../types/api.ts';
import { normalizeAuditResponse, normalizeContentPlan } from './normalizers.ts';

export const STORAGE_VERSION = 'weblens_v2';
export const AUDIT_HISTORY_KEY = `weblens_audits_${STORAGE_VERSION}`;
export const USER_PREFS_KEY = `weblens_prefs_${STORAGE_VERSION}`;
export const CHAT_HISTORY_PREFIX = `weblens_chat_${STORAGE_VERSION}_`;
export const PROMPT_DRAFT_PREFIX = `weblens_prompt_${STORAGE_VERSION}_`;
export const RETENTION_DAYS_DEFAULT = 7;

export interface StoredAuditSummary {
  audit_id: string;
  url: string;
  timestamp: number;
  strategy: 'mobile' | 'desktop';
  scores: Record<string, number | null>;
  finding_count: number;
  verified_defect_count: number;
}

export interface StoredAuditSession {
  version: string;
  audit_id: string;
  url: string;
  timestamp: number;
  strategy: 'mobile' | 'desktop';
  audit: AuditResponse;
  visual?: VisualAuditResponse | null;
  screenshot_improve?: ScreenshotImproveResponse | null;
  content_plan?: ContentPlanResponse | null;
  reviewed_finding_ids?: string[];
  conversation_history?: ChatMessage[];
  prompt_draft?: string;
}

export interface UserPreferences {
  defaultStrategy: 'mobile' | 'desktop';
  defaultIncludePagespeed: boolean;
  defaultFramework: string;
  autoSaveLocal: boolean;
  retentionDays: number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultStrategy: 'mobile',
  defaultIncludePagespeed: true,
  defaultFramework: 'framework_neutral',
  autoSaveLocal: true,
  retentionDays: RETENTION_DAYS_DEFAULT,
};

/**
 * Checks if browser storage is supported and available.
 */
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage' = 'localStorage'): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const storage = window[type];
    const testKey = `__weblens_test__`;
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe JSON parser.
 */
function safeJsonParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const browserStorage = {
  /**
   * Cleans up audits older than the retention period.
   */
  cleanupExpired(): void {
    if (!isStorageAvailable()) return;

    try {
      const prefs = this.getUserPreferences();
      const cutoff = Date.now() - prefs.retentionDays * 24 * 60 * 60 * 1000;
      const summaries = this.getRecentAudits();
      const activeSummaries: StoredAuditSummary[] = [];

      for (const item of summaries) {
        if (item.timestamp < cutoff) {
          localStorage.removeItem(`weblens_audit_record_${STORAGE_VERSION}_${item.audit_id}`);
          localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${item.audit_id}`);
          localStorage.removeItem(`${PROMPT_DRAFT_PREFIX}${item.audit_id}`);
        } else {
          activeSummaries.push(item);
        }
      }

      localStorage.setItem(AUDIT_HISTORY_KEY, JSON.stringify(activeSummaries));
    } catch {
      // Ignore cleanup error
    }
  },

  /**
   * Saves an entire audit session into localStorage.
   */
  saveAuditSession(
    audit: AuditResponse,
    extras?: {
      contentPlan?: ContentPlanResponse | null;
      reviewedIds?: string[];
      chatMessages?: ChatMessage[];
      promptDraft?: string;
      visual?: VisualAuditResponse | null;
      screenshotImprove?: ScreenshotImproveResponse | null;
    }
  ): boolean {
    if (!isStorageAvailable() || !audit || !audit.audit_id) return false;

    try {
      const scores: Record<string, number | null> = {};
      if (audit.pagespeed?.scores) {
        for (const [key, val] of Object.entries(audit.pagespeed.scores)) {
          scores[key] = val.score;
        }
      }

      const verifiedCount = audit.findings.filter(
        (f) => f.classification === 'verified_defect'
      ).length;

      const summaryItem: StoredAuditSummary = {
        audit_id: audit.audit_id,
        url: audit.url,
        timestamp: Date.now(),
        strategy: audit.strategy,
        scores,
        finding_count: audit.findings.length,
        verified_defect_count: verifiedCount,
      };

      // 1. Update index list (keep up to 15 recent audits)
      const existingSummaries = this.getRecentAudits().filter(
        (s) => s.audit_id !== audit.audit_id
      );
      const newSummaries = [summaryItem, ...existingSummaries].slice(0, 15);
      localStorage.setItem(AUDIT_HISTORY_KEY, JSON.stringify(newSummaries));

      // 2. Save full session record
      const fullRecord: StoredAuditSession = {
        version: STORAGE_VERSION,
        audit_id: audit.audit_id,
        url: audit.url,
        timestamp: Date.now(),
        strategy: audit.strategy,
        audit,
        visual: extras?.visual || null,
        screenshot_improve: extras?.screenshotImprove || null,
        content_plan: extras?.contentPlan || null,
        reviewed_finding_ids: extras?.reviewedIds || [],
        conversation_history: extras?.chatMessages || [],
        prompt_draft: extras?.promptDraft || '',
      };

      try {
        localStorage.setItem(
          `weblens_audit_record_${STORAGE_VERSION}_${audit.audit_id}`,
          JSON.stringify(fullRecord)
        );
      } catch (innerErr) {
        if ((innerErr as Error)?.name === 'QuotaExceededError') {
          this.pruneOldestAudit();
          if (fullRecord.visual) {
            fullRecord.visual = {
              ...fullRecord.visual,
              viewport_screenshot: null,
              full_page_screenshot: null,
            };
          }
          localStorage.setItem(
            `weblens_audit_record_${STORAGE_VERSION}_${audit.audit_id}`,
            JSON.stringify(fullRecord)
          );
        }
      }

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Retrieves summary index of all stored audits.
   */
  getRecentAudits(): StoredAuditSummary[] {
    if (!isStorageAvailable()) return [];
    const raw = localStorage.getItem(AUDIT_HISTORY_KEY);
    return safeJsonParse<StoredAuditSummary[]>(raw, []);
  },

  /**
   * Alias for getRecentAudits to list stored audit summaries.
   */
  listAuditSessions(): StoredAuditSummary[] {
    return this.getRecentAudits();
  },

  /**
   * Retrieves full audit session record by audit ID.
   */
  getAuditSession(auditId: string): StoredAuditSession | null {
    if (!isStorageAvailable() || !auditId) return null;
    const raw = localStorage.getItem(`weblens_audit_record_${STORAGE_VERSION}_${auditId}`);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;

      // Validate through normalizer to prevent any undefined .length errors
      const normalizedAudit = normalizeAuditResponse(parsed.audit);
      const normalizedContentPlan = parsed.content_plan
        ? normalizeContentPlan(parsed.content_plan)
        : null;

      return {
        version: parsed.version || STORAGE_VERSION,
        audit_id: parsed.audit_id || auditId,
        url: parsed.url || normalizedAudit.url,
        timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
        strategy: parsed.strategy || 'mobile',
        audit: normalizedAudit,
        visual: parsed.visual || null,
        screenshot_improve: parsed.screenshot_improve || null,
        content_plan: normalizedContentPlan,
        reviewed_finding_ids: Array.isArray(parsed.reviewed_finding_ids) ? parsed.reviewed_finding_ids : [],
        conversation_history: Array.isArray(parsed.conversation_history) ? parsed.conversation_history : [],
        prompt_draft: typeof parsed.prompt_draft === 'string' ? parsed.prompt_draft : '',
      };
    } catch {
      return null;
    }
  },

  /**
   * Retrieves the most recent audit session record.
   */
  getLatestAuditSession(): StoredAuditSession | null {
    const recents = this.getRecentAudits();
    if (recents.length === 0) return null;
    return this.getAuditSession(recents[0].audit_id);
  },

  /**
   * Deletes a specific audit and associated data from storage.
   */
  deleteAudit(auditId: string): void {
    if (!isStorageAvailable()) return;
    try {
      localStorage.removeItem(`weblens_audit_record_${STORAGE_VERSION}_${auditId}`);
      localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${auditId}`);
      localStorage.removeItem(`${PROMPT_DRAFT_PREFIX}${auditId}`);

      const remaining = this.getRecentAudits().filter((s) => s.audit_id !== auditId);
      localStorage.setItem(AUDIT_HISTORY_KEY, JSON.stringify(remaining));
    } catch {
      // Ignore
    }
  },

  /**
   * Deletes all WebLens browser data.
   */
  clearAll(): void {
    if (!isStorageAvailable()) return;
    try {
      const summaries = this.getRecentAudits();
      for (const s of summaries) {
        localStorage.removeItem(`weblens_audit_record_${STORAGE_VERSION}_${s.audit_id}`);
        localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${s.audit_id}`);
        localStorage.removeItem(`${PROMPT_DRAFT_PREFIX}${s.audit_id}`);
      }
      localStorage.removeItem(AUDIT_HISTORY_KEY);
      localStorage.removeItem(USER_PREFS_KEY);

      // Clean explanation cache
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('weblens_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore
    }
  },

  /**
   * Saves user preferences.
   */
  saveUserPreferences(prefs: Partial<UserPreferences>): void {
    if (!isStorageAvailable()) return;
    try {
      const current = this.getUserPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(USER_PREFS_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  },

  /**
   * Gets user preferences.
   */
  getUserPreferences(): UserPreferences {
    if (!isStorageAvailable()) return DEFAULT_PREFERENCES;
    const raw = localStorage.getItem(USER_PREFS_KEY);
    return safeJsonParse<UserPreferences>(raw, DEFAULT_PREFERENCES);
  },

  /**
   * Saves an auto-saved draft of the coding prompt.
   */
  savePromptDraft(auditId: string, promptText: string): void {
    if (!isStorageAvailable() || !auditId) return;
    try {
      localStorage.setItem(`${PROMPT_DRAFT_PREFIX}${auditId}`, promptText);
    } catch {
      // Ignore
    }
  },

  /**
   * Gets prompt draft for a session.
   */
  getPromptDraft(auditId: string): string {
    if (!isStorageAvailable() || !auditId) return '';
    return localStorage.getItem(`${PROMPT_DRAFT_PREFIX}${auditId}`) || '';
  },

  /**
   * Prunes the oldest stored audit to free up space.
   */
  pruneOldestAudit(): void {
    try {
      const summaries = this.getRecentAudits();
      if (summaries.length === 0) return;
      const oldest = summaries[summaries.length - 1];
      this.deleteAudit(oldest.audit_id);
    } catch {
      // Ignore
    }
  },
};
