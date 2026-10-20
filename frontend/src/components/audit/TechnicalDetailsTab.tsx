'use client';

import React, { useState } from 'react';
import {
  FileCode,
  Image as ImageIcon,
  Link2,
  ListOrdered,
  AlertTriangle,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PageSnapshot, PageSpeedData } from '@/types/api';
import { formatBytes, cn } from '@/lib/utils';

interface TechnicalDetailsTabProps {
  pageSnapshot: PageSnapshot;
  pagespeed: PageSpeedData | null;
}

export function TechnicalDetailsTab({
  pageSnapshot,
  pagespeed,
}: TechnicalDetailsTabProps) {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'headings' | 'images' | 'links' | 'raw_audit' | 'json'>('headings');

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify({ page_snapshot: pageSnapshot, pagespeed }, null, 2)
      );
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Safe fallback arrays and dictionaries
  const imagesList = pageSnapshot?.images || [];
  const linksList = pageSnapshot?.links || [];
  const headingsDict = pageSnapshot?.headings || {};
  const auditFindings = pagespeed?.audit_findings || [];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.08)] p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-[#F7F7F8] tracking-tight">
            Technical Audit Diagnostics &amp; DOM Details
          </h3>
          <p className="text-xs text-[#B4B4BD] mt-1">
            Raw inspect data from HTML parsing, HTTP response headers, and Google PageSpeed Insights.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyJson}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#17171B] hover:bg-[#222228] text-[#F7F7F8] border border-[rgba(255,255,255,0.08)] transition-colors self-start sm:self-auto"
        >
          {copiedRaw ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied JSON</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#777781]" />
              <span>Copy Full JSON Data</span>
            </>
          )}
        </button>
      </div>

      {/* Snapshot Metadata Quick Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.06)]">
          <span className="text-[#777781] block mb-0.5 font-medium">HTTP Status</span>
          <span className="font-mono font-bold text-[#F7F7F8]">{pageSnapshot?.status_code || 200} OK</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.06)]">
          <span className="text-[#777781] block mb-0.5 font-medium">HTML Payload</span>
          <span className="font-mono font-bold text-[#F7F7F8]">{formatBytes(pageSnapshot?.html_bytes || 0)}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.06)]">
          <span className="text-[#777781] block mb-0.5 font-medium">Content-Type</span>
          <span className="font-mono text-[#B4B4BD] truncate block">{pageSnapshot?.content_type || 'text/html'}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.06)]">
          <span className="text-[#777781] block mb-0.5 font-medium">Lighthouse Run</span>
          <span className="font-mono text-[#B4B4BD]">{pagespeed ? `v${pagespeed.lighthouse_version || '11'}` : 'Disabled'}</span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-[rgba(255,255,255,0.08)] text-xs gap-1 overflow-x-auto">
        {[
          { id: 'headings', label: 'Headings Hierarchy', icon: ListOrdered },
          { id: 'images', label: `Images (${imagesList.length})`, icon: ImageIcon },
          { id: 'links', label: `Links (${linksList.length})`, icon: Link2 },
          { id: 'raw_audit', label: 'Lighthouse Raw Audits', icon: FileCode },
          { id: 'json', label: 'JSON Payload', icon: Code },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-[#F20D4F] text-[#F7F7F8]'
                  : 'border-transparent text-[#777781] hover:text-[#F7F7F8]'
              }`}
            >
              <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#F20D4F]' : 'text-[#777781]')} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab 1: Headings Outline */}
      {activeSubTab === 'headings' && (
        <div className="bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.08)] p-5 shadow-card space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#777781]">
            Detected Heading Tags Outline
          </h4>

          {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => {
            const list = headingsDict[level] || [];
            return (
              <div key={level} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#17171B] text-[#F7F7F8] border border-[rgba(255,255,255,0.08)]">
                    &lt;{level}&gt;
                  </span>
                  <span className="text-xs text-[#777781]">({list.length} found)</span>
                </div>

                {list.length === 0 ? (
                  <p className="text-xs text-[#777781] italic pl-2">None</p>
                ) : (
                  <ul className="space-y-1 pl-2">
                    {list.map((h, i) => (
                      <li key={i} className="text-xs text-[#F7F7F8] font-medium flex items-start gap-1.5">
                        <span className="text-[#F20D4F]">•</span>
                        <span>&ldquo;{h}&rdquo;</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Sub-tab 2: Images Table */}
      {activeSubTab === 'images' && (
        <div className="bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111114] text-[#777781] border-b border-[rgba(255,255,255,0.06)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Alt Attribute Status</th>
                  <th className="py-2.5 px-4">Alt Text</th>
                  <th className="py-2.5 px-4">Image Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {imagesList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[#777781]">
                      No &lt;img&gt; elements detected in static HTML snapshot.
                    </td>
                  </tr>
                ) : (
                  imagesList.map((img, i) => (
                    <tr key={i} className="hover:bg-[#111114]/60">
                      <td className="py-2 px-4 whitespace-nowrap">
                        {img.has_alt_attribute ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                            Present
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/50 text-rose-300 border border-rose-500/30">
                            Missing Alt
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 text-[#F7F7F8] font-mono text-[11px] max-w-xs truncate">
                        {img.alt || <span className="text-[#777781] italic">Empty string</span>}
                      </td>
                      <td className="py-2 px-4 text-[#B4B4BD] font-mono text-[11px] max-w-md truncate">
                        {img.src || 'No src'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Links Table */}
      {activeSubTab === 'links' && (
        <div className="bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111114] text-[#777781] border-b border-[rgba(255,255,255,0.06)] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Anchor Text</th>
                  <th className="py-2.5 px-4">Target Href</th>
                  <th className="py-2.5 px-4">Rel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {linksList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[#777781]">
                      No links detected in HTML snapshot.
                    </td>
                  </tr>
                ) : (
                  linksList.map((link, i) => (
                    <tr key={i} className="hover:bg-[#111114]/60">
                      <td className="py-2 px-4 text-[#F7F7F8] font-medium max-w-xs truncate">
                        {link.text ? link.text : <span className="text-[#F20D4F] italic">Empty anchor text</span>}
                      </td>
                      <td className="py-2 px-4 text-[#B4B4BD] font-mono text-[11px] max-w-md truncate">
                        {link.href}
                      </td>
                      <td className="py-2 px-4 text-[#777781] font-mono text-[11px]">
                        {link.rel ? JSON.stringify(link.rel) : 'none'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 4: Lighthouse Raw Audits */}
      {activeSubTab === 'raw_audit' && (
        <div className="space-y-4">
          {!pagespeed ? (
            <div className="p-8 rounded-2xl bg-[#0B0B0D] border border-[rgba(255,255,255,0.08)] text-center text-xs text-[#777781]">
              PageSpeed Insights was not enabled during this audit.
            </div>
          ) : (
            <div className="bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.08)] p-5 shadow-card space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#777781]">
                Lighthouse Failed / Sub-Optimal Audits ({auditFindings.length})
              </h4>
              <div className="space-y-2.5">
                {auditFindings.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.06)] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F7F7F8]">{item.title}</span>
                      <span className="font-mono text-[#777781] text-[11px]">{item.id}</span>
                    </div>
                    {item.display_value && (
                      <div className="text-[#B4B4BD] font-semibold mt-1">
                        Measured: {item.display_value}
                      </div>
                    )}
                    {item.description && (
                      <p className="text-[#777781] mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 5: JSON Payload */}
      {activeSubTab === 'json' && (
        <div className="bg-[#050505] rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 overflow-x-auto shadow-inner">
          <pre className="text-xs font-mono text-[#B4B4BD] leading-relaxed whitespace-pre-wrap">
            {JSON.stringify({ page_snapshot: pageSnapshot, pagespeed }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
