'use strict';
/* eslint-disable @next/next/no-img-element */

'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Eye,
  Terminal,
  Globe,
  AlertCircle,
  Target,
} from 'lucide-react';
import type {
  AuditResponse,
  VisualAuditResponse,
  VisualAnnotation,
} from '@/types/api';
import { api } from '@/services/api';
import { browserStorage } from '@/services/storage';
import {
  processAuditIntelligence,
  type MeaningfulIssue,
  type PageSection,
} from '@/services/intelligence';
import {
  buildCompleteRedesign,
  type CompleteRedesignModel,
} from '@/services/redesign';
import { ImplementationPromptModal } from '@/components/studio/ImplementationPromptModal';
import { ScreenshotVisionStudio } from '@/components/studio/ScreenshotVisionStudio';

function InspectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlParam = searchParams.get('url') || '';
  const auditIdParam = searchParams.get('auditId') || '';
  const issueIdParam = searchParams.get('issueId') || '';
  const sectionParam = (searchParams.get('section') as PageSection) || null;
  const strategyParam = (searchParams.get('strategy') as 'mobile' | 'desktop') || 'desktop';
  const modeParam = searchParams.get('mode') === 'original' ? 'original' : 'vision_hub';

  const [currentUrl, setCurrentUrl] = useState(urlParam);
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>(strategyParam);
  const [auditData, setAuditData] = useState<AuditResponse | null>(null);
  const [visualData, setVisualData] = useState<VisualAuditResponse | null>(null);
  const [isVisualLoading, setIsVisualLoading] = useState(false);

  // Active Issue & Navigation
  const [selectedIssueId, setSelectedIssueId] = useState<string>(issueIdParam);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'original' | 'vision_hub'>(modeParam);
  const [showIssues, setShowIssues] = useState<boolean>(Boolean(issueIdParam));
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);

  // Persistent screenshot state
  const [persistedScreenshot, setPersistedScreenshot] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('weblensai_active_screenshot') || null;
    }
    return null;
  });
  const [sectionFilter, setSectionFilter] = useState<PageSection | 'all'>(
    sectionParam && ['header', 'hero', 'main', 'media', 'cta', 'footer'].includes(sectionParam)
      ? sectionParam
      : 'all'
  );

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Load audit data from storage or API
  useEffect(() => {
    if (auditIdParam) {
      const session = browserStorage.getAuditSession(auditIdParam);
      if (session && session.audit) {
        setAuditData(session.audit);
        setCurrentUrl(session.audit.url);
        if (session.visual) {
          setVisualData(session.visual);
          if (session.visual.viewport_screenshot && !persistedScreenshot) {
            setPersistedScreenshot(session.visual.viewport_screenshot);
          }
        }
        return;
      }
    }

    const latest = browserStorage.getLatestAuditSession();
    if (latest && latest.audit) {
      setAuditData(latest.audit);
      setCurrentUrl(latest.audit.url);
      if (latest.visual) {
        setVisualData(latest.visual);
        if (latest.visual.viewport_screenshot && !persistedScreenshot) {
          setPersistedScreenshot(latest.visual.viewport_screenshot);
        }
      }
    } else if (urlParam) {
      setCurrentUrl(urlParam);
    }
  }, [auditIdParam, urlParam, persistedScreenshot]);

  // Synchronize persisted screenshot
  useEffect(() => {
    if (persistedScreenshot && typeof window !== 'undefined') {
      try {
        localStorage.setItem('weblensai_active_screenshot', persistedScreenshot);
      } catch (err) {
        console.warn('Storage quota warning', err);
      }
    }
  }, [persistedScreenshot]);

  // Run visual audit if missing
  useEffect(() => {
    if (auditData && !visualData && !isVisualLoading) {
      setIsVisualLoading(true);
      api
        .runVisualAudit({
          url: auditData.url,
          strategy,
          findings: auditData.findings as unknown as Record<string, unknown>[],
        })
        .then((vis) => {
          if (vis && !vis.viewport_screenshot && persistedScreenshot) {
            vis.viewport_screenshot = persistedScreenshot;
            vis.full_page_screenshot = persistedScreenshot;
          }
          setVisualData(vis);
          browserStorage.saveAuditSession(auditData, { visual: vis });
        })
        .catch((err) => {
          console.warn('Visual audit failed to load', err);
        })
        .finally(() => {
          setIsVisualLoading(false);
        });
    }
  }, [auditData, visualData, strategy, isVisualLoading, persistedScreenshot]);

  // Process issues
  const intelligence = useMemo(() => {
    if (!auditData) return null;
    return processAuditIntelligence(auditData);
  }, [auditData]);

  const allIssues: MeaningfulIssue[] = useMemo(() => {
    if (!intelligence) return [];
    return [
      ...intelligence.fixFirst,
      ...intelligence.improveNext,
      ...intelligence.optional,
    ];
  }, [intelligence]);

  const visibleIssues = useMemo(() => {
    if (sectionFilter === 'all') return allIssues;
    return allIssues.filter((i) => i.pageSection === sectionFilter);
  }, [allIssues, sectionFilter]);

  const activeIssue = useMemo(() => {
    if (!selectedIssueId && visibleIssues.length > 0) return visibleIssues[0];
    return allIssues.find((i) => i.id === selectedIssueId) || visibleIssues[0] || null;
  }, [selectedIssueId, visibleIssues, allIssues]);

  // Redesign model for AI vision prompts
  const redesignModel: CompleteRedesignModel | null = useMemo(() => {
    if (!auditData) return null;
    return buildCompleteRedesign(auditData, allIssues);
  }, [auditData, allIssues]);

  // Change strategy
  const handleStrategyChange = (newStrat: 'mobile' | 'desktop') => {
    setStrategy(newStrat);
    if (!auditData) return;
    setIsVisualLoading(true);
    api
      .runVisualAudit({
        url: auditData.url,
        strategy: newStrat,
        findings: auditData.findings as unknown as Record<string, unknown>[],
      })
      .then((vis) => {
        if (vis && !vis.viewport_screenshot && persistedScreenshot) {
          vis.viewport_screenshot = persistedScreenshot;
          vis.full_page_screenshot = persistedScreenshot;
        }
        setVisualData(vis);
        browserStorage.saveAuditSession(auditData, { visual: vis });
      })
      .finally(() => setIsVisualLoading(false));
  };

  // Match annotation to active issue
  const activeAnnotation: VisualAnnotation | null = useMemo(() => {
    if (!activeIssue || !visualData?.annotations) return null;
    return (
      visualData.annotations.find(
        (a) =>
          (activeIssue.selector && a.selector && a.selector.includes(activeIssue.selector)) ||
          (activeIssue.originalFinding?.id && a.finding_id === activeIssue.originalFinding.id) ||
          a.title.toLowerCase().includes(activeIssue.title.toLowerCase().slice(0, 15))
      ) || null
    );
  }, [activeIssue, visualData]);

  // Auto-scroll canvas to active element location
  useEffect(() => {
    if (viewMode === 'original' && activeAnnotation?.box && canvasContainerRef.current) {
      const box = activeAnnotation.box;
      const container = canvasContainerRef.current;
      const scale = zoomLevel / 100;
      const targetScrollTop = box.y * scale - container.clientHeight / 2 + (box.height * scale) / 2;
      const targetScrollLeft = box.x * scale - container.clientWidth / 2 + (box.width * scale) / 2;
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
    }
  }, [viewMode, activeAnnotation?.id, activeAnnotation?.box, zoomLevel]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const activeScreenshot =
    persistedScreenshot || visualData?.viewport_screenshot || visualData?.full_page_screenshot;
  const viewport = visualData?.viewport || { width: 1280, height: 800 };
  const backUrl = `/audit?url=${encodeURIComponent(currentUrl)}&strategy=${strategy}`;

  return (
    <div className="min-h-screen bg-[#050505] text-[#F7F7F8] flex flex-col select-none pt-16 sm:pt-20">
      {/* 1. Top Improvement Studio Navigation Bar */}
      <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-40 shadow-dropdown">
        {/* Left: Back & Website Info */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group"
            title="Go to WebLens AI Home"
          >
            <img
              src="/favicon.png"
              alt="WebLens AI"
              className="w-7 h-7 rounded-lg object-contain bg-[#17171B] border border-[rgba(255,255,255,0.09)] shrink-0"
            />
          </Link>

          <Link
            href={backUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#B4B4BD] hover:text-[#F7F7F8] hover:bg-[#17171B] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Audit</span>
          </Link>

          <span className="text-[rgba(255,255,255,0.15)] hidden sm:inline">|</span>

          {/* URL & Studio Title */}
          <div className="flex items-center gap-2 max-w-xs md:max-w-md truncate">
            <Globe className="w-3.5 h-3.5 text-[#F20D4F] shrink-0" />
            <span className="font-mono text-xs font-semibold text-[#F7F7F8] truncate">
              {currentUrl || 'Audited Page'}
            </span>
          </div>
        </div>

        {/* Center: Mode Switch (Annotated Canvas vs AI Vision Studio) */}
        <div className="flex items-center bg-[#111114] border border-[rgba(255,255,255,0.08)] rounded-xl p-0.5 shadow-card">
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              viewMode === 'original'
                ? 'bg-[#17171B] text-[#F7F7F8] border border-[rgba(255,255,255,0.12)] shadow-xs'
                : 'text-[#777781] hover:text-[#F7F7F8]'
            }`}
          >
            <Target className={`w-3.5 h-3.5 ${viewMode === 'original' ? 'text-[#F20D4F]' : 'text-[#777781]'}`} />
            <span>Annotated Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('vision_hub')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              viewMode === 'vision_hub'
                ? 'bg-[#F20D4F] text-white shadow-accent'
                : 'text-[#777781] hover:text-[#F20D4F]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span>AI Vision Studio</span>
          </button>
        </div>

        {/* Right: Viewport, Show Issues Toggle, Zoom, Prompt Button */}
        <div className="flex items-center gap-2">
          {/* Viewport: Desktop / Mobile */}
          <div className="flex items-center bg-[#111114] border border-[rgba(255,255,255,0.08)] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => handleStrategyChange('desktop')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                strategy === 'desktop'
                  ? 'bg-[#17171B] text-[#F7F7F8] shadow-xs'
                  : 'text-[#777781] hover:text-[#F7F7F8]'
              }`}
              title="Desktop View (1280px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleStrategyChange('mobile')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                strategy === 'mobile'
                  ? 'bg-[#17171B] text-[#F7F7F8] shadow-xs'
                  : 'text-[#777781] hover:text-[#F7F7F8]'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Show Issues Toggle */}
          <button
            type="button"
            onClick={() => setShowIssues(!showIssues)}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showIssues
                ? 'bg-[rgba(242,13,79,0.15)] text-[#F20D4F] border-[rgba(242,13,79,0.4)] shadow-xs'
                : 'bg-[#111114] text-[#B4B4BD] border-[rgba(255,255,255,0.08)] hover:text-[#F7F7F8]'
            }`}
            title="Toggle audit issue annotations and markers"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Issues ({allIssues.length})</span>
          </button>

          {/* Zoom Controls */}
          <div className="hidden xl:flex items-center bg-[#111114] border border-[rgba(255,255,255,0.08)] rounded-xl p-0.5 shadow-card">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
              className="p-1 rounded-lg text-[#777781] hover:text-[#F7F7F8]"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-mono text-[11px] font-semibold text-[#F7F7F8]">
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
              className="p-1 rounded-lg text-[#777781] hover:text-[#F7F7F8]"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullScreen}
            className="hidden sm:inline-flex p-1.5 rounded-xl bg-[#111114] border border-[rgba(255,255,255,0.08)] text-[#B4B4BD] hover:text-[#F7F7F8] transition shadow-xs"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Prominent Generate Implementation Prompt Button */}
          <button
            type="button"
            onClick={() => setIsPromptModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white text-xs font-bold shadow-[0_0_16px_-3px_rgba(242,13,79,0.4)] transition shrink-0"
          >
            <Terminal className="w-3.5 h-3.5 text-pink-200" />
            <span>Generate Prompt</span>
          </button>
        </div>
      </header>

      {/* 2. Main Large Website Canvas Workspace */}
      <div className="relative flex-1 overflow-hidden flex flex-col bg-[#050505] bg-tech-grid">
        {isVisualLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0B0B0D] border border-[rgba(242,13,79,0.35)] flex items-center justify-center p-2.5 shadow-accent">
              <img
                src="/favicon.png"
                alt="WebLens AI"
                className="w-full h-full object-contain animate-pulse"
              />
            </div>
            <h3 className="text-base font-bold text-[#F7F7F8]">
              Capturing High-Resolution Page Render...
            </h3>
            <p className="text-xs text-[#B4B4BD] max-w-sm text-center">
              Playwright Chromium is measuring element bounding boxes and rendering the visual viewport.
            </p>
          </div>
        ) : (
          <>
            {/* VIEW MODE 1: ORIGINAL (Captured Screenshot with Reticle Markers) */}
            {viewMode === 'original' && (
              <div
                ref={canvasContainerRef}
                className="flex-1 overflow-auto bg-[#050505] p-4 sm:p-8 flex justify-center items-start relative select-none"
              >
                {activeScreenshot ? (
                  <div
                    className="relative transition-transform duration-100 ease-out shadow-dropdown rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-[#0B0B0D]"
                    style={{
                      transform: `scale(${zoomLevel / 100})`,
                      transformOrigin: 'top center',
                      width: strategy === 'mobile' ? '390px' : `${viewport.width}px`,
                      maxWidth: '100%',
                    }}
                  >
                    <img
                      src={activeScreenshot}
                      alt={`Audited original website screenshot for ${currentUrl}`}
                      className="block w-full h-auto select-none"
                    />

                    {/* Numbered Issue Markers & Precision Reticles */}
                    {showIssues &&
                      visualData?.annotations?.map((anno) => {
                        const isSelected =
                          activeIssue?.selector && anno.selector
                            ? anno.selector.includes(activeIssue.selector)
                            : activeIssue?.title.toLowerCase().slice(0, 15) ===
                              anno.title.toLowerCase().slice(0, 15);

                        const leftPct = (anno.box.x / viewport.width) * 100;
                        const topPct = (anno.box.y / viewport.height) * 100;
                        const widthPx = Math.max(28, anno.box.width);
                        const heightPx = Math.max(28, anno.box.height);

                        return (
                          <div
                            key={anno.id}
                            onClick={() => {
                              const matchedIssue = allIssues.find(
                                (i) =>
                                  (i.selector && anno.selector && anno.selector.includes(i.selector)) ||
                                  (i.originalFinding?.id && aId(i.originalFinding.id, anno.finding_id))
                              );
                              if (matchedIssue) {
                                if (sectionFilter !== 'all' && matchedIssue.pageSection !== sectionFilter) {
                                  setSectionFilter('all');
                                }
                                setSelectedIssueId(matchedIssue.id);
                              }
                            }}
                            className={`absolute cursor-pointer transition-all duration-150 group z-20 ${
                              isSelected
                                ? 'rounded-lg border-2 border-[#F20D4F] bg-[rgba(242,13,79,0.25)] ring-4 ring-[#F20D4F]/30 z-30'
                                : 'rounded-md border border-dashed border-[#F20D4F]/60 hover:border-[#F20D4F] hover:bg-[rgba(242,13,79,0.1)]'
                            }`}
                            style={{
                              left: `${leftPct}%`,
                              top: `${topPct}%`,
                              width: `${(widthPx / viewport.width) * 100}%`,
                              height: `${(heightPx / viewport.height) * 100}%`,
                            }}
                          >
                            <span
                              className={`absolute -top-3 -left-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-card bg-[#F20D4F] transition-transform group-hover:scale-110 ${
                                isSelected ? 'scale-110 ring-2 ring-white' : ''
                              }`}
                            >
                              {anno.number}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 max-w-md mx-auto text-center my-12 bg-[#0B0B0D] rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-card">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-[#F7F7F8]">
                      Original Screenshot Unavailable
                    </h3>
                    <p className="text-xs text-[#B4B4BD] leading-relaxed">
                      The site blocks automated browsers or requires authentication. You can still inspect
                      the AI Vision Studio and generate coding agent prompts.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 2: AI VISION STUDIO (Screenshot-to-LLM Prompts & Code) */}
            {viewMode === 'vision_hub' && (
              <div className="flex-1 overflow-auto bg-[#050505] p-4 sm:p-8 flex justify-center items-start">
                <div className="w-full max-w-7xl">
                  <ScreenshotVisionStudio
                    visual={
                      visualData ||
                      (persistedScreenshot
                        ? {
                            url: currentUrl,
                            strategy,
                            viewport:
                              strategy === 'mobile'
                                ? { width: 390, height: 844, device_scale_factor: 1 }
                                : { width: 1280, height: 800, device_scale_factor: 1 },
                            full_page_dimensions:
                              strategy === 'mobile'
                                ? { width: 390, height: 844 }
                                : { width: 1280, height: 800 },
                            viewport_screenshot: persistedScreenshot,
                            full_page_screenshot: persistedScreenshot,
                            annotations: [],
                            failed: false,
                          }
                        : null)
                    }
                    redesign={redesignModel}
                    issues={allIssues}
                    pageUrl={currentUrl}
                    strategy={strategy}
                    onStrategyChange={handleStrategyChange}
                    onCustomScreenshotUpload={(base64) => {
                      if (typeof window !== 'undefined') {
                        try {
                          localStorage.setItem('weblensai_active_screenshot', base64);
                        } catch (err) {
                          console.warn('Storage quota warning', err);
                        }
                      }
                      setPersistedScreenshot(base64);
                      if (visualData) {
                        setVisualData({
                          ...visualData,
                          viewport_screenshot: base64,
                          full_page_screenshot: base64,
                        });
                      } else {
                        setVisualData({
                          url: currentUrl || 'custom-upload',
                          strategy,
                          viewport:
                            strategy === 'mobile'
                              ? { width: 390, height: 844, device_scale_factor: 1 }
                              : { width: 1280, height: 800, device_scale_factor: 1 },
                          full_page_dimensions:
                            strategy === 'mobile'
                              ? { width: 390, height: 844 }
                              : { width: 1280, height: 800 },
                          viewport_screenshot: base64,
                          full_page_screenshot: base64,
                          annotations: [],
                          failed: false,
                        });
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* 3. Bottom Summary & Quick Controls Bar */}
        {redesignModel && (
          <div className="border-t border-[rgba(255,255,255,0.08)] bg-[#0B0B0D] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#B4B4BD] shrink-0 z-30 shadow-card">
            {/* Summary Tag */}
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-[#F20D4F] animate-pulse" />
              <span className="font-bold text-[#F7F7F8]">
                {redesignModel.summary.totalResolvedCount} Actionable Findings Grounded in Evidence
              </span>
              <span className="text-[rgba(255,255,255,0.15)] hidden sm:inline">&bull;</span>
              <span className="text-[#777781] hidden sm:inline">
                {redesignModel.summary.keyImprovements[0]}
              </span>
            </div>

            {/* Selected Issue Preview */}
            {activeIssue && showIssues && (
              <div className="hidden lg:flex items-center gap-2 max-w-md truncate">
                <span className="font-bold text-[#F20D4F] truncate">
                  {activeIssue.title}:
                </span>
                <span className="text-[#B4B4BD] truncate">
                  {activeIssue.recommendedFix}
                </span>
              </div>
            )}

            {/* Action to Launch Prompt Studio */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPromptModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F20D4F] hover:bg-[#FF245F] text-white font-bold text-xs shadow-xs transition"
              >
                <Terminal className="w-3.5 h-3.5 text-pink-200" />
                <span>View &amp; Copy Prompt</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Implementation Prompt Studio Modal */}
      {redesignModel && (
        <ImplementationPromptModal
          isOpen={isPromptModalOpen}
          onClose={() => setIsPromptModalOpen(false)}
          url={currentUrl}
          strategy={strategy}
          redesign={redesignModel}
          allIssues={allIssues}
        />
      )}
    </div>
  );
}

function aId(id1?: string | null, id2?: string | null) {
  if (!id1 || !id2) return false;
  return id1 === id2 || id1.includes(id2) || id2.includes(id1);
}

export default function InspectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#B4B4BD] text-sm">
          Loading WebLens Visual Studio...
        </div>
      }
    >
      <InspectContent />
    </Suspense>
  );
}
