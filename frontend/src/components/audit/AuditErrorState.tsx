'use strict';

import React, { useState } from 'react';
import { AlertCircle, RefreshCw, ZapOff, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditErrorStateProps {
  error: Error | string;
  onRetry: () => void;
  onRetryWithoutPagespeed?: () => void;
  includePagespeed?: boolean;
}

export function AuditErrorState({
  error,
  onRetry,
  onRetryWithoutPagespeed,
  includePagespeed,
}: AuditErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);
  const errorMessage = typeof error === 'string' ? error : error.message;

  // Classify error type for helpful user advice
  const isSsrf =
    errorMessage.toLowerCase().includes('private') ||
    errorMessage.toLowerCase().includes('safe') ||
    errorMessage.toLowerCase().includes('localhost');

  const isTimeout =
    errorMessage.toLowerCase().includes('timed out') ||
    errorMessage.toLowerCase().includes('timeout') ||
    errorMessage.toLowerCase().includes('took too long');

  const isPagespeed =
    errorMessage.toLowerCase().includes('pagespeed') ||
    errorMessage.toLowerCase().includes('lighthouse');

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 select-none">
      <div className="bg-[#0B0B0D] rounded-3xl border border-[rgba(242,13,79,0.35)] shadow-card p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[rgba(242,13,79,0.15)] border border-[rgba(242,13,79,0.3)] flex items-center justify-center text-[#F20D4F] mb-5 shadow-accent">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-[#F7F7F8] tracking-tight">
          Audit Could Not Be Completed
        </h3>

        <p className="mt-2 text-sm text-[#B4B4BD] leading-relaxed max-w-lg mx-auto">
          {isSsrf ? (
            'The URL could not be audited because it resolves to a private IP, loopback, or non-public domain. For security, only public websites can be audited.'
          ) : isTimeout ? (
            'The target website or the PageSpeed service took too long to respond. The server might be slow or blocking bot requests.'
          ) : isPagespeed ? (
            'Google PageSpeed Insights encountered an issue analyzing this page. You can still run the HTML structure audit without PageSpeed.'
          ) : (
            'We encountered an issue communicating with the website or audit backend.'
          )}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#F20D4F] hover:bg-[#FF245F] transition-all shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          {includePagespeed && onRetryWithoutPagespeed && (
            <button
              onClick={onRetryWithoutPagespeed}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#F7F7F8] bg-[#17171B] hover:bg-[#222228] border border-[rgba(255,255,255,0.08)] transition-colors"
            >
              <ZapOff className="w-4 h-4 text-[#777781]" />
              <span>Retry without PageSpeed</span>
            </button>
          )}
        </div>

        {/* Technical details accordion */}
        <div className="mt-8 border-t border-[rgba(255,255,255,0.08)] pt-4 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs font-medium text-[#777781] hover:text-[#F7F7F8] py-1"
          >
            <span>Technical diagnostic details</span>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-[#777781]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#777781]" />
            )}
          </button>

          {showDetails && (
            <pre className="mt-2 p-3.5 rounded-xl bg-[#050505] text-[#B4B4BD] text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all border border-[rgba(255,255,255,0.08)] leading-relaxed">
              {errorMessage}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
