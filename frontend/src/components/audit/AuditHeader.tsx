'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  Zap,
  ArrowRight,
  History,
  Check,
} from 'lucide-react';
import { cn, isValidUrl } from '@/lib/utils';

interface AuditHeaderProps {
  url: string;
  strategy: 'mobile' | 'desktop';
  includePagespeed: boolean;
  isLoading: boolean;
  onAudit: (url: string, strategy: 'mobile' | 'desktop', includePagespeed: boolean) => void;
  onOpenHistory?: () => void;
  savedTimestamp?: number | null;
  historyCount?: number;
}

export function AuditHeader({
  url: initialUrl,
  strategy: initialStrategy,
  includePagespeed: initialIncludePagespeed,
  isLoading,
  onAudit,
  onOpenHistory,
  savedTimestamp,
  historyCount = 0,
}: AuditHeaderProps) {
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>(initialStrategy);
  const [includePagespeed, setIncludePagespeed] = useState(initialIncludePagespeed);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    setInputUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(null);

    let targetUrl = inputUrl.trim();
    if (!targetUrl) {
      setUrlError('Please enter a website URL');
      return;
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
      setInputUrl(targetUrl);
    }

    if (!isValidUrl(targetUrl)) {
      setUrlError('Please enter a valid HTTP or HTTPS URL');
      return;
    }

    onAudit(targetUrl, strategy, includePagespeed);
  };

  return (
    <div className="bg-[#0B0B0D] border-b border-[rgba(255,255,255,0.08)] shadow-card select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top Controls: History & Local Storage Status */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(255,255,255,0.06)] text-xs">
          <div className="flex items-center gap-3">
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#111114] hover:bg-[#17171B] border border-[rgba(255,255,255,0.08)] text-[#F7F7F8] font-semibold transition-colors"
                title="View past audits saved in this browser"
              >
                <History className="w-3.5 h-3.5 text-[#F20D4F]" />
                <span>Saved Audits ({historyCount})</span>
              </button>
            )}

            {savedTimestamp && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Saved locally</span>
              </span>
            )}
          </div>

          <div className="text-[11px] text-[#777781]">
            Audit results are preserved in your local browser session
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* URL Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777781]">
                <Globe className="w-5 h-5 text-[#777781]" />
              </div>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="https://example.com"
                aria-label="Website URL to audit"
                disabled={isLoading}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 text-sm sm:text-base font-medium rounded-xl border bg-[#111114] text-[#F7F7F8] placeholder:text-[#777781] focus:bg-[#17171B] focus:outline-none focus:ring-2 focus:ring-[#F20D4F] focus:border-[#F20D4F] transition-all',
                  urlError ? 'border-[#F20D4F] focus:ring-[#F20D4F]' : 'border-[rgba(255,255,255,0.1)]'
                )}
              />
            </div>

            {/* Device Strategy Selector */}
            <div className="flex items-center gap-1 bg-[#111114] p-1 rounded-xl border border-[rgba(255,255,255,0.08)] self-start lg:self-auto">
              <button
                type="button"
                onClick={() => setStrategy('mobile')}
                disabled={isLoading}
                aria-pressed={strategy === 'mobile'}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  strategy === 'mobile'
                    ? 'bg-[#17171B] text-[#F7F7F8] border border-[rgba(255,255,255,0.1)] shadow-xs'
                    : 'text-[#777781] hover:text-[#F7F7F8]'
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
              <button
                type="button"
                onClick={() => setStrategy('desktop')}
                disabled={isLoading}
                aria-pressed={strategy === 'desktop'}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  strategy === 'desktop'
                    ? 'bg-[#17171B] text-[#F7F7F8] border border-[rgba(255,255,255,0.1)] shadow-xs'
                    : 'text-[#777781] hover:text-[#F7F7F8]'
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
            </div>

            {/* Include PageSpeed Toggle */}
            <label
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#B4B4BD] bg-[#111114] hover:bg-[#17171B] border border-[rgba(255,255,255,0.08)] rounded-xl cursor-pointer transition-colors select-none self-start lg:self-auto"
              title="Runs official Google PageSpeed Insights for Core Web Vitals"
            >
              <input
                type="checkbox"
                checked={includePagespeed}
                onChange={(e) => setIncludePagespeed(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 text-[#F20D4F] rounded border-[rgba(255,255,255,0.2)] focus:ring-[#F20D4F] bg-[#17171B]"
              />
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Include PageSpeed
              </span>
            </label>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#F20D4F] hover:bg-[#FF245F] shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F20D4F]',
                isLoading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing Website...</span>
                </>
              ) : (
                <>
                  <span>Audit Website</span>
                  <ArrowRight className="w-4 h-4 text-pink-200" />
                </>
              )}
            </button>
          </div>

          {urlError && (
            <p className="text-xs font-medium text-[#F20D4F] pl-1">{urlError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
