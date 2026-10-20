'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  Trash2,
  Calendar,
  Globe,
  ExternalLink,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Shield,
  Layers,
} from 'lucide-react';
import { StoredAuditSummary, browserStorage } from '@/services/storage';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { cn } from '@/lib/utils';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAudit: (auditId: string) => void;
  currentAuditId?: string;
}

export function AuditHistoryModal({
  isOpen,
  onClose,
  onSelectAudit,
  currentAuditId,
}: AuditHistoryModalProps) {
  const [summaries, setSummaries] = useState<StoredAuditSummary[]>([]);
  const [retentionDays, setRetentionDays] = useState(7);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadData = () => {
    browserStorage.cleanupExpired();
    const list = browserStorage.getRecentAudits();
    setSummaries(list);
    const prefs = browserStorage.getUserPreferences();
    setRetentionDays(prefs.retentionDays || 7);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    browserStorage.deleteAudit(id);
    loadData();
  };

  const handleClearAll = () => {
    browserStorage.clearAll();
    setSummaries([]);
    setConfirmClear(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.12)] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex items-center justify-between bg-[#0B0B0D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#17171B] border border-[rgba(255,255,255,0.08)] text-[#F20D4F] flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F7F7F8] tracking-tight">
                Browser Audit History
              </h3>
              <p className="text-xs text-[#777781]">
                Audits saved locally in this browser profile • Auto-retained for {retentionDays} days
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#777781] hover:text-[#F7F7F8] hover:bg-[#17171B] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Banner */}
        <div className="px-5 py-2.5 bg-[#F20D4F]/10 border-b border-[rgba(242,13,79,0.2)] text-xs text-pink-200 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#F20D4F] shrink-0" />
          <span>
            Working data is saved safely in your browser&apos;s localStorage. It is never synced to external servers or exposed to other users.
          </span>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {summaries.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <History className="w-8 h-8 text-[#777781] mx-auto" />
              <h4 className="text-sm font-bold text-[#F7F7F8]">No Audits Saved Locally Yet</h4>
              <p className="text-xs text-[#777781] max-w-sm mx-auto">
                Audits you run in this browser will appear here so you can revisit them anytime without re-running the crawler.
              </p>
            </div>
          ) : (
            summaries.map((item) => {
              const isCurrent = item.audit_id === currentAuditId;
              const dateStr = new Date(item.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.audit_id}
                  onClick={() => {
                    onSelectAudit(item.audit_id);
                    onClose();
                  }}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                    isCurrent
                      ? 'border-[#F20D4F] bg-[#F20D4F]/10 ring-1 ring-[#F20D4F]/30'
                      : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)] hover:bg-[#111114] bg-[#0E0E12]'
                  )}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#F7F7F8] truncate">
                        {item.url}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F20D4F] text-white">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#777781]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#777781]" />
                        {dateStr}
                      </span>
                      <span>•</span>
                      <span className="capitalize flex items-center gap-1">
                        {item.strategy === 'mobile' ? (
                          <Smartphone className="w-3.5 h-3.5 text-[#777781]" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-[#777781]" />
                        )}
                        {item.strategy}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-[#B4B4BD]">
                        {item.finding_count} issues ({item.verified_defect_count} verified)
                      </span>
                    </div>
                  </div>

                  {/* Quick scores */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    {item.scores && Object.keys(item.scores).length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        {typeof item.scores.performance === 'number' && (
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-md font-bold text-[11px] border',
                              item.scores.performance >= 90
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                : item.scores.performance >= 50
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                                : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                            )}
                            title="Performance score"
                          >
                            P: {item.scores.performance}
                          </span>
                        )}
                        {typeof item.scores.seo === 'number' && (
                          <span className="px-2 py-0.5 rounded-md font-bold text-[11px] bg-[#17171B] border border-[rgba(255,255,255,0.08)] text-[#F7F7F8]" title="SEO score">
                            SEO: {item.scores.seo}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.audit_id, e)}
                      className="p-1.5 rounded-lg text-[#777781] hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete this saved audit"
                      aria-label="Delete audit record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#050505] flex flex-wrap items-center justify-between gap-3 text-xs">
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-semibold">Delete all {summaries.length} audits?</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-500"
              >
                Yes, delete all
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 rounded-xl bg-[#17171B] text-[#F7F7F8] hover:bg-[#222228] border border-[rgba(255,255,255,0.08)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={summaries.length === 0}
              onClick={() => setConfirmClear(true)}
              className="text-[#777781] hover:text-rose-400 font-medium disabled:opacity-30 transition-colors"
            >
              Clear all browser audit data
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#F20D4F] hover:bg-[#FF245F] text-white shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] transition-colors ml-auto"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
