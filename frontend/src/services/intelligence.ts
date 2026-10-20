import type { AuditResponse, Finding, PageSpeedData } from '../types/api.ts';

export type IssuePriority = 'fix_first' | 'improve_next' | 'optional';
export type IssueCategory = 'performance' | 'usability' | 'seo' | 'accessibility';
export type EvidenceKind = 'measured' | 'observed' | 'suggested';
export type PageSection = 'header' | 'hero' | 'main' | 'media' | 'cta' | 'footer';

export interface MeaningfulIssue {
  id: string;
  title: string;
  category: IssueCategory;
  priority: IssuePriority;
  evidenceKind: EvidenceKind;
  pageSection: PageSection;
  problem: string;
  whyItMatters: string;
  recommendedFix: string;
  selector?: string | null;
  elementText?: string | null;
  metricEvidence?: {
    name: string;
    value: string;
    status: 'good' | 'needs_work' | 'poor' | string;
  } | null;
  suggestedReplacement?: string | null;
  agentPrompt?: string | null;
  isTechnicalCheck: boolean;
  originalFinding?: Finding | null;
  pageUrl?: string;
  severity?: string;
}

export function derivePageSection(
  selector?: string | null,
  title: string = '',
  originalFinding?: Finding | null
): PageSection {
  const sel = (selector || '').toLowerCase();
  const t = title.toLowerCase();
  const id = (originalFinding?.id || '').toLowerCase();

  if (sel.includes('header') || sel.includes('nav') || sel.includes('menu') || id.includes('nav')) {
    return 'header';
  }
  if (sel.includes('hero') || sel.includes('h1') || t.includes('headline') || id.includes('h1')) {
    return 'hero';
  }
  if (
    sel.includes('btn') ||
    sel.includes('button') ||
    sel.includes('cta') ||
    sel.includes('form') ||
    sel.includes('input') ||
    t.includes('cta') ||
    t.includes('click here') ||
    id.includes('link')
  ) {
    return 'cta';
  }
  if (
    sel.includes('img') ||
    sel.includes('picture') ||
    sel.includes('video') ||
    sel.includes('svg') ||
    t.includes('image') ||
    t.includes('lcp') ||
    id.includes('alt') ||
    id.includes('lcp')
  ) {
    return 'media';
  }
  if (sel.includes('footer') || sel.includes('copyright') || id.includes('footer')) {
    return 'footer';
  }
  return 'main';
}

export function groupIssuesBySection(issues: MeaningfulIssue[]): {
  section: PageSection;
  label: string;
  issues: MeaningfulIssue[];
}[] {
  const sectionLabels: Record<PageSection, string> = {
    header: 'Header & Navigation',
    hero: 'Hero Section',
    main: 'Main Content',
    media: 'Images & Media',
    cta: 'Forms & Calls to Action',
    footer: 'Footer',
  };

  const map = new Map<PageSection, MeaningfulIssue[]>();
  for (const i of issues) {
    const list = map.get(i.pageSection) || [];
    list.push(i);
    map.set(i.pageSection, list);
  }

  const order: PageSection[] = ['header', 'hero', 'cta', 'media', 'main', 'footer'];
  const result: { section: PageSection; label: string; issues: MeaningfulIssue[] }[] = [];

  for (const sec of order) {
    const list = map.get(sec);
    if (list && list.length > 0) {
      result.push({
        section: sec,
        label: sectionLabels[sec],
        issues: list,
      });
    }
  }

  return result;
}

export interface AuditIntelligenceSummary {
  assessmentText: string;
  recommendedNextStep: string;
  totalIssuesCount: number;
  top3Issues: MeaningfulIssue[];
  fixFirst: MeaningfulIssue[];
  improveNext: MeaningfulIssue[];
  optional: MeaningfulIssue[];
  routineChecks: MeaningfulIssue[];
}

/**
 * Translates technical Lighthouse or rule findings into plain English.
 */
export function translateTitle(rawTitle: string, id: string): string {
  const lower = (rawTitle + ' ' + id).toLowerCase();
  if (lower.includes('legacy-javascript') || lower.includes('legacy javascript')) {
    return 'Legacy JavaScript delivered to modern browsers';
  }
  if (lower.includes('largest-contentful-paint') || lower.includes('lcp')) {
    return 'The main image or headline loads too slowly';
  }
  if (lower.includes('cumulative-layout-shift') || lower.includes('cls')) {
    return 'Page elements jump around while loading';
  }
  if (lower.includes('total-blocking-time') || lower.includes('tbt')) {
    return 'Page freezes or delays clicks during loading';
  }
  if (lower.includes('speed-index')) {
    return 'Visual content appears slowly for visitors';
  }
  if (lower.includes('render-blocking')) {
    return 'Scripts or stylesheets delay page display';
  }
  if (lower.includes('modern-image-formats') || lower.includes('uses-optimized-images') || lower.includes('oversized')) {
    return 'Images are larger than necessary';
  }
  if (lower.includes('meta_description') || lower.includes('meta-description')) {
    return 'Missing page summary for search engines';
  }
  if (lower.includes('missing_title') || lower.includes('document-title')) {
    return 'Page has no title in search results';
  }
  if (lower.includes('long_title')) {
    return 'Page title is too long for search results';
  }
  if (lower.includes('missing_h1') || lower.includes('heading-order')) {
    return 'Main headline (H1) is missing or out of order';
  }
  if (lower.includes('multiple_h1')) {
    return 'More than one main headline on this page';
  }
  if (lower.includes('missing_alt') || lower.includes('image-alt')) {
    return 'Images are missing descriptions for screen readers';
  }
  if (lower.includes('ambiguous_links') || lower.includes('link-name')) {
    return 'Button or link text is too vague ("Click here")';
  }
  if (lower.includes('color-contrast') || lower.includes('contrast')) {
    return 'Text contrast is too low to read easily';
  }
  if (lower.includes('tap-targets') || lower.includes('target-size')) {
    return 'Buttons are too small or close together on mobile';
  }
  return rawTitle;
}

/**
 * Determines plain-language problem description, strictly discarding any placeholder text.
 */
export function deriveProblem(f: Finding, title: string): string {
  const rawWhy = f.why_it_matters;
  if (
    rawWhy &&
    rawWhy !== 'Needs plain-language interpretation.' &&
    rawWhy !== 'Generate an evidence-grounded explanation.' &&
    !rawWhy.toLowerCase().includes('needs plain-language') &&
    !rawWhy.toLowerCase().includes('evidence-grounded')
  ) {
    return rawWhy;
  }
  const t = title.toLowerCase();
  const id = (f.id || '').toLowerCase();
  if (t.includes('legacy javascript') || id.includes('legacy-javascript')) {
    return 'Modern browsers are receiving legacy polyfills and transpiled code that are only needed by obsolete browsers, unnecessarily enlarging bundle sizes.';
  }
  if (t.includes('slow') || t.includes('main image') || id.includes('lcp')) {
    return "Your website's primary visual content takes too long to appear, frustrating mobile visitors.";
  }
  if (t.includes('jump around') || t.includes('layout shift') || id.includes('cls')) {
    return 'Buttons and text shift position as images load, causing accidental clicks and poor user experience.';
  }
  if (t.includes('freez') || t.includes('blocking') || id.includes('tbt')) {
    return 'Heavy JavaScript execution freezes user interactions and delays click responsiveness.';
  }
  if (t.includes('summary') || t.includes('description') || id.includes('meta-description')) {
    return 'Search engines will display random text snippets instead of a compelling summary of what your business offers.';
  }
  if (t.includes('title') || id.includes('title')) {
    return 'Search engines and social shares lack a clear, recognizable name for this page.';
  }
  if (t.includes('headline') || id.includes('h1')) {
    return 'Visitors and search engines cannot instantly identify the primary topic or value proposition of this page.';
  }
  if (t.includes('screen readers') || t.includes('alt') || id.includes('alt')) {
    return 'Visually impaired visitors using screen readers cannot understand what your images show.';
  }
  if (t.includes('vague') || id.includes('link')) {
    return 'Visitors cannot tell where links lead without reading the surrounding paragraphs.';
  }
  if (t.includes('contrast') || id.includes('contrast')) {
    return 'Text is difficult to read against the background, especially in sunlight or on low-brightness screens.';
  }
  if (t.includes('tap') || t.includes('target') || id.includes('tap-target')) {
    return 'Buttons or interactive targets are too small or clustered too closely together for reliable tapping on mobile devices.';
  }
  return 'This issue impairs usability, speed, or search ranking.';
}

/**
 * Determines plain-language why-it-matters explanation, strictly discarding placeholders.
 */
export function deriveWhyItMatters(f: Finding, problem: string, title: string): string {
  const rawWhy = f.why_it_matters;
  if (
    rawWhy &&
    rawWhy !== 'Needs plain-language interpretation.' &&
    rawWhy !== 'Generate an evidence-grounded explanation.' &&
    !rawWhy.toLowerCase().includes('needs plain-language') &&
    !rawWhy.toLowerCase().includes('evidence-grounded')
  ) {
    return rawWhy;
  }
  const t = title.toLowerCase();
  const id = (f.id || '').toLowerCase();
  if (t.includes('legacy javascript') || id.includes('legacy-javascript')) {
    return 'Unnecessary polyfills inflate the client JavaScript bundle, increasing mobile download times and consuming user bandwidth and memory without benefit.';
  }
  if (t.includes('slow') || t.includes('main image') || id.includes('lcp')) {
    return 'Largest Contentful Paint is a primary Google ranking factor. Slow LCP directly increases bounce rates and reduces conversions.';
  }
  if (t.includes('jump around') || t.includes('layout shift') || id.includes('cls')) {
    return 'Layout shifts cause visitors to click the wrong buttons or lose reading position, creating a frustrating experience that hurts conversion rates.';
  }
  if (t.includes('freez') || t.includes('blocking') || id.includes('tbt')) {
    return 'When interactive elements do not respond instantly to clicks, users perceive the website as broken or untrustworthy.';
  }
  if (t.includes('summary') || t.includes('description') || id.includes('meta-description')) {
    return 'Search engines rely on meta descriptions to display search snippets. Missing summaries result in lower click-through rates from search results.';
  }
  if (t.includes('headline') || id.includes('h1')) {
    return 'A clear H1 headline anchors user attention and assists search crawlers in understanding the core topic of your page.';
  }
  if (t.includes('screen readers') || t.includes('alt') || id.includes('alt')) {
    return 'Descriptive alt text is required by WCAG accessibility guidelines to ensure equal access for visually impaired visitors.';
  }
  if (t.includes('contrast') || id.includes('contrast')) {
    return 'Poor contrast strains visitor eyesight, reduces content comprehension, and violates accessibility standards.';
  }
  if (t.includes('tap') || t.includes('target') || id.includes('tap-target')) {
    return 'Mobile visitors struggle with small tap targets, leading to mis-clicks and lost conversions on touch devices.';
  }
  return problem || 'Resolving this defect directly improves site quality, user engagement, and search engine visibility.';
}

/**
 * Determines actionable solution in plain language, strictly discarding placeholders.
 */
export function deriveRecommendedFix(f: Finding, title: string): string {
  const rawFix = f.suggested_change;
  if (
    rawFix &&
    rawFix !== 'Generate an evidence-grounded explanation.' &&
    rawFix !== 'Needs plain-language interpretation.' &&
    !rawFix.toLowerCase().includes('evidence-grounded') &&
    !rawFix.toLowerCase().includes('plain-language')
  ) {
    return rawFix;
  }
  const t = title.toLowerCase();
  const id = (f.id || '').toLowerCase();
  if (t.includes('legacy javascript') || id.includes('legacy-javascript')) {
    return 'Update build tooling and Browserslist configuration to target modern browsers (ES2020+), removing obsolete polyfills from the production bundle.';
  }
  if (t.includes('slow') || t.includes('main image') || id.includes('lcp')) {
    return 'Compress the hero image into modern WebP format, set explicit width/height, and prioritize its loading.';
  }
  if (t.includes('jump around') || t.includes('layout shift') || id.includes('cls')) {
    return 'Set explicit width and height dimensions on all images and video containers.';
  }
  if (t.includes('summary') || t.includes('description') || id.includes('meta-description')) {
    return 'Write a concise 140–160 character meta description explaining what you offer and add it to your page settings.';
  }
  if (t.includes('headline') || id.includes('h1')) {
    return 'Add a clear, benefit-driven <h1> headline at the top of the hero section.';
  }
  if (t.includes('screen readers') || t.includes('alt') || id.includes('alt')) {
    return 'Add short descriptive alt text to all informative images, or alt="" if purely decorative.';
  }
  if (t.includes('vague') || id.includes('link')) {
    return 'Replace generic phrases like "Click here" or "Read more" with descriptive labels like "View Pricing" or "Book Consultation".';
  }
  if (t.includes('contrast') || id.includes('contrast')) {
    return 'Adjust text or background color to achieve a minimum contrast ratio of 4.5:1 (WCAG AA).';
  }
  if (t.includes('tap') || t.includes('target') || id.includes('tap-target')) {
    return 'Increase button dimensions and padding so touch targets are at least 48x48px with 8px spacing.';
  }
  return 'Update the element according to modern web best practices.';
}

export interface FixPromptOptions {
  title: string;
  category: IssueCategory;
  severity?: string;
  auditUrl: string;
  problem: string;
  whyItMatters: string;
  recommendedFix: string;
  selector?: string | null;
  elementText?: string | null;
  metricEvidence?: {
    name: string;
    value: string;
    status: 'good' | 'needs_work' | 'poor' | string;
  } | null;
  originalFinding?: Finding | null;
  variant?: 'standard' | 'focused';
}

/**
 * Generates a context-aware, production-grade AI Fix Prompt for any audit finding.
 */
export function generateFindingFixPrompt(opts: FixPromptOptions): string {
  const {
    title,
    category,
    severity = 'medium',
    auditUrl,
    problem,
    whyItMatters,
    recommendedFix,
    selector,
    elementText,
    metricEvidence,
    originalFinding,
    variant = 'standard',
  } = opts;

  const t = title.toLowerCase();
  const id = (originalFinding?.id || '').toLowerCase();
  const isLegacyJs = t.includes('legacy javascript') || id.includes('legacy-javascript');
  const isLcp = t.includes('largest-contentful-paint') || t.includes('lcp') || id.includes('lcp') || t.includes('main image');
  const isCls = t.includes('cumulative-layout-shift') || t.includes('cls') || id.includes('cls') || t.includes('jump around');
  const isTbt = t.includes('total-blocking-time') || t.includes('tbt') || id.includes('tbt') || t.includes('freez');
  const isAlt = t.includes('alt') || id.includes('alt') || t.includes('screen reader');
  const isContrast = t.includes('contrast') || id.includes('contrast');
  const isTapTarget = t.includes('tap') || t.includes('target') || id.includes('tap-target');
  const isMetaDesc = t.includes('description') || id.includes('meta_description') || id.includes('meta-description');
  const isTitle = t.includes('title') && !t.includes('subtitle');
  const isHeading = t.includes('h1') || t.includes('headline') || id.includes('h1');
  const isLinks = t.includes('vague') || id.includes('ambiguous_links') || id.includes('link-name');
  const isRenderBlocking = t.includes('render-blocking') || id.includes('render-blocking');
  const isUnusedCode = t.includes('unused') || id.includes('unused-javascript') || id.includes('unused-css');

  // Evidence Summary & Honest Handling of Missing Telemetry
  let evidenceSection = '';
  if (selector) {
    evidenceSection += `- Target Element Selector: \`${selector}\`\n`;
  } else {
    evidenceSection += `- Target Element Selector: None isolated (Page-level, bundle-level, or template defect)\n`;
    evidenceSection += `  Notice: No single CSS selector is reported in audit telemetry. Do NOT assume or invent an arbitrary selector. Inspect your repository's build configuration, page layout, or document <head>.\n`;
  }

  if (elementText) {
    evidenceSection += `- Flagged Element Text/Content: "${elementText.replace(/\n+/g, ' ').slice(0, 150)}"\n`;
  }
  if (metricEvidence) {
    evidenceSection += `- Measured Metric: ${metricEvidence.name} = ${metricEvidence.value} (Rating: ${metricEvidence.status.toUpperCase()})\n`;
  }
  if (originalFinding?.implementation_hint && !originalFinding.implementation_hint.includes('plain-language')) {
    evidenceSection += `- Telemetry Hint: ${originalFinding.implementation_hint}\n`;
  }

  // Likely Cause (Evidence-Grounded Only)
  let likelyCause = '';
  if (isLegacyJs) {
    likelyCause = 'Likely caused by build targets configured for obsolete browsers (e.g., Browserslist defaults or Babel/core-js polyfills), bundling legacy transpilation output to modern clients.';
  } else if (isLcp) {
    likelyCause = 'Likely caused by a large unoptimized hero image, slow server response time, or render-blocking stylesheets delaying the paint of the primary visual element.';
  } else if (isCls) {
    likelyCause = 'Likely caused by images, banners, or embeds rendered without explicit width/height attributes or CSS aspect-ratio reservations, shifting nearby content upon load.';
  } else if (isTbt) {
    likelyCause = 'Likely caused by heavy JavaScript bundle execution or third-party tracking scripts monopolizing the main browser thread during initial hydration.';
  } else if (isAlt) {
    likelyCause = 'Likely caused by <img> elements authored without an alt attribute or dynamic components omitting the alt property.';
  } else if (isContrast) {
    likelyCause = 'Likely caused by text foreground color failing to achieve WCAG AA minimum contrast ratio (4.5:1) against its background surface.';
  } else if (isTapTarget) {
    likelyCause = 'Likely caused by touch targets with computed dimensions under 48x48px or spaced closer than 8px apart on mobile viewports.';
  } else if (isMetaDesc) {
    likelyCause = 'Likely caused by missing <meta name="description"> tag in page head or framework metadata export.';
  } else if (isHeading) {
    likelyCause = 'Likely caused by missing <h1> tag or multiple <h1> tags in template structure.';
  } else if (isLinks) {
    likelyCause = 'Likely caused by generic link or button labels ("click here", "more") lacking descriptive context.';
  } else if (isRenderBlocking) {
    likelyCause = 'Likely caused by synchronous CSS/JS links in document <head> that pause HTML parsing until network fetch finishes.';
  } else if (isUnusedCode) {
    likelyCause = 'Likely caused by bundling whole libraries instead of modular imports, or lack of tree-shaking / route-level code splitting.';
  } else {
    likelyCause = 'Grounded in audit telemetry: the flagged element or configuration deviates from modern web standards.';
  }

  // Step-by-Step Investigation & Remediation Instructions
  let instructions = '';
  if (isLegacyJs) {
    instructions = `1. Investigate the supplied audit evidence to identify the source of unnecessary legacy JavaScript delivered to modern browsers.
2. Inspect the relevant dependencies, build configuration (e.g., package.json browserslist, babel.config.js, tsconfig.json target, Vite/Webpack/Next.js config), and generated bundles.
3. Determine which changes are justified by the evidence.
4. Recommend the smallest safe improvement, preserve existing functionality and browser compatibility requirements, and verify the result with a production build and a repeat audit.`;
  } else if (isLcp) {
    instructions = `1. Inspect the primary visual container / hero element on ${auditUrl}.
2. If the LCP element is an image, convert to modern WebP/AVIF format, add explicit width and height attributes, and add fetchpriority="high" (or priority in Next.js Image).
3. If loaded via CSS background-image, consider converting to an HTML image or adding a <link rel="preload"> in the <head>.
4. Defer or remove any render-blocking scripts preceding this element.`;
  } else if (isCls) {
    instructions = `1. Identify elements that shift during initial page load.
2. Ensure all <img>, <video>, and dynamic banner containers declare explicit width and height HTML attributes or CSS aspect-ratio.
3. Use CSS contain: layout or skeleton placeholders for asynchronous widgets.
4. Avoid inserting new DOM elements above existing rendered content after page mount.`;
  } else if (isTbt) {
    instructions = `1. Profile main-thread execution in Chrome DevTools Performance panel to identify long tasks (>50ms).
2. Defer non-critical scripts (e.g. analytics, chat widgets, marketing tags) with defer/async or dynamic import() after initial render.
3. Code-split heavy client components using dynamic imports.
4. Break up long synchronous calculations into requestIdleCallback or smaller microtasks.`;
  } else if (isAlt) {
    instructions = `1. Locate the image element corresponding to ${selector ? `\`${selector}\`` : 'the flagged image'} in your templates.
2. If the image conveys information, add a concise, meaningful alt="[descriptive text]" attribute.
3. If the image is purely decorative or accompanied by adjacent text, set alt="" or aria-hidden="true" so screen readers can skip it.`;
  } else if (isContrast) {
    instructions = `1. Locate the flagged element ${selector ? `(\`${selector}\`)` : ''} and its background styling in your CSS / Tailwind configuration.
2. Adjust the text color or background color to achieve a minimum contrast ratio of 4.5:1 for normal text (or 3:1 for large text >=18pt / bold >=14pt).
3. Ensure readability in both light and dark display modes if applicable.`;
  } else if (isTapTarget) {
    instructions = `1. Locate the flagged interactive element ${selector ? `(\`${selector}\`)` : ''}.
2. Increase the clickable bounding box using CSS padding (e.g., p-2.5 or min-h-[48px] min-w-[48px]) so touch targets are at least 48x48px on mobile devices.
3. Maintain at least 8px spacing between adjacent touch targets to eliminate accidental taps.`;
  } else if (isMetaDesc) {
    instructions = `1. Locate the <head> template or framework metadata export for ${auditUrl}.
2. Add a compelling <meta name="description"> between 140 and 160 characters describing the site's primary benefit.
3. Do not alter any visual UI elements or layout styling.`;
  } else if (isHeading) {
    instructions = `1. Inspect the semantic heading hierarchy in the page template.
2. Ensure exactly one <h1> element exists per page, placed at the top of the main content area with clear, benefit-driven text.
3. Change any conflicting secondary headlines to <h2> or <h3> to establish an unbroken heading hierarchy.`;
  } else if (isLinks) {
    instructions = `1. Locate the link or button element ${selector ? `(\`${selector}\`)` : ''}.
2. Replace generic text like "Click here" or "Read more" with descriptive copy indicating the exact destination (e.g. "Explore Our Features" or "Download Documentation").
3. If visual design requires a brief label, provide an aria-label with the full context.`;
  } else {
    instructions = `1. Inspect the codebase for the element, template, or configuration indicated in the audit evidence.
2. Review the recommended fix: "${recommendedFix}".
3. Make the minimal necessary change to satisfy the standard without altering unrelated code.`;
  }

  // Verification Steps
  let verification = '';
  if (isLegacyJs) {
    verification = 'Run `npm run build` (or production bundler equivalent), inspect the generated bundle output sizes, and verify that legacy polyfills are eliminated while modern browser functionality remains intact.';
  } else if (isLcp || isCls || isTbt) {
    verification = 'Run a production build, serve the site locally or deploy to preview, and run Lighthouse / DevTools Performance audit to confirm metric improvement meets target thresholds.';
  } else if (isAlt || isContrast || isTapTarget) {
    verification = 'Inspect the element in Chrome DevTools Elements and Accessibility / Lighthouse panels to verify that accessibility criteria (WCAG AA) pass with zero warnings.';
  } else if (isMetaDesc || isTitle || isHeading) {
    verification = 'Inspect the generated HTML source or DOM to confirm tag presence, character length, and semantic hierarchy.';
  } else {
    verification = originalFinding?.verification || 'Re-run the WebLens AI audit or check browser DevTools to confirm the issue is resolved without regression.';
  }

  if (variant === 'focused') {
    return `### TASK: Fix "${title}" (${severity.toUpperCase()}) on ${auditUrl}

#### 1. Audit Finding
- Title: ${title}
- Category: ${category.toUpperCase()} | Severity: ${severity.toUpperCase()}
- Problem: ${problem}
- Fix Target: ${recommendedFix}

#### 2. Evidence
${evidenceSection.trim()}

#### 3. Action Plan
${instructions}

#### 4. Guardrails & Verification
- Make the smallest safe diff.
- Do NOT invent or hallucinate files, components, or APIs.
- Preserve existing styling, frameworks, and coding conventions.
- Verification: ${verification}`;
  }

  return `### AI Fix Prompt: WebLens AI Finding Remediation

#### 1. Audit Finding Overview
- Finding: ${title}
- Category: ${category.toUpperCase()}
- Severity: ${severity.toUpperCase()}
- Affected URL: ${auditUrl}

#### 2. Defect Description & Impact
- Problem: ${problem}
- Why It Matters: ${whyItMatters}
- Recommended Change: ${recommendedFix}

#### 3. Audit Evidence Collected
${evidenceSection.trim()}

#### 4. Likely Cause (Evidence-Grounded)
${likelyCause}

#### 5. Step-by-Step Investigation & Remediation Instructions
${instructions}

#### 6. Implementation Constraints & Guardrails
- Make the smallest appropriate change that completely resolves the issue.
- Preserve existing design, layout, styling system (Tailwind/CSS modules), and architectural conventions.
- Do NOT invent files, components, APIs, or evidence that do not exist in the project repository.
- Preserve existing user-facing copy and functionality unless explicitly instructed to fix defective content.

#### 7. Verification Steps
${verification}`;
}

/**
 * Processes and prioritizes an audit response into meaningful, non-technical issues.
 */
export function processAuditIntelligence(audit: AuditResponse): AuditIntelligenceSummary {
  const issues: MeaningfulIssue[] = [];
  const seenTitles = new Set<string>();

  const pagespeed: PageSpeedData | null = audit?.pagespeed || null;
  const metrics = pagespeed?.metrics || {};

  // 1. Evaluate Core Web Vitals (Measured Facts)
  const lcp = metrics['largest-contentful-paint'];
  if (lcp && typeof lcp.value === 'number' && lcp.value > 2500) {
    const lcpSec = (lcp.value / 1000).toFixed(1);
    issues.push({
      id: 'metric_lcp',
      title: 'The main image or headline loads too slowly',
      category: 'performance',
      priority: lcp.value > 4000 ? 'fix_first' : 'improve_next',
      evidenceKind: 'measured',
      pageSection: 'hero',
      problem: `The primary visible content takes ${lcpSec} seconds to load. Visitors on mobile devices frequently leave sites that take longer than 2.5s.`,
      whyItMatters: 'Largest Contentful Paint is a primary Google ranking factor. Slow LCP directly increases bounce rates and reduces conversions.',
      recommendedFix: 'Compress the largest visible image, use WebP or AVIF format, and add fetchpriority="high" to load it immediately.',
      metricEvidence: {
        name: 'LCP (Largest Contentful Paint)',
        value: `${lcpSec}s`,
        status: lcp.value > 4000 ? 'poor' : 'needs_work',
      },
      agentPrompt: generateFindingFixPrompt({
        title: 'The main image or headline loads too slowly (LCP)',
        category: 'performance',
        severity: lcp.value > 4000 ? 'critical' : 'medium',
        auditUrl: audit.url,
        problem: `The primary visible content takes ${lcpSec} seconds to load. Visitors on mobile devices frequently leave sites that take longer than 2.5s.`,
        whyItMatters: 'Largest Contentful Paint is a primary Google ranking factor. Slow LCP directly increases bounce rates and reduces conversions.',
        recommendedFix: 'Compress the largest visible image, use WebP or AVIF format, and add fetchpriority="high" to load it immediately.',
        selector: null,
        elementText: null,
        metricEvidence: {
          name: 'LCP (Largest Contentful Paint)',
          value: `${lcpSec}s`,
          status: lcp.value > 4000 ? 'poor' : 'needs_work',
        },
      }),
      isTechnicalCheck: false,
      pageUrl: audit.url,
      severity: lcp.value > 4000 ? 'critical' : 'medium',
    });
    seenTitles.add('the main image or headline loads too slowly');
  }

  const cls = metrics['cumulative-layout-shift'];
  if (cls && typeof cls.value === 'number' && cls.value > 0.1) {
    issues.push({
      id: 'metric_cls',
      title: 'Page elements jump around while loading',
      category: 'performance',
      priority: cls.value > 0.25 ? 'fix_first' : 'improve_next',
      evidenceKind: 'measured',
      pageSection: 'main',
      problem: `Visual elements shifted unexpectedly during loading (CLS score: ${cls.value.toFixed(2)}).`,
      whyItMatters: 'Layout shifts cause visitors to click the wrong buttons or lose reading position, creating a frustrating experience.',
      recommendedFix: 'Reserve space for banners, ads, and images before they load by defining explicit aspect ratios or CSS width and height.',
      metricEvidence: {
        name: 'CLS (Layout Shift)',
        value: cls.value.toFixed(2),
        status: cls.value > 0.25 ? 'poor' : 'needs_work',
      },
      agentPrompt: generateFindingFixPrompt({
        title: 'Page elements jump around while loading (CLS)',
        category: 'performance',
        severity: cls.value > 0.25 ? 'critical' : 'medium',
        auditUrl: audit.url,
        problem: `Visual elements shifted unexpectedly during loading (CLS score: ${cls.value.toFixed(2)}).`,
        whyItMatters: 'Layout shifts cause visitors to click the wrong buttons or lose reading position, creating a frustrating experience.',
        recommendedFix: 'Reserve space for banners, ads, and images before they load by defining explicit aspect ratios or CSS width and height.',
        selector: null,
        elementText: null,
        metricEvidence: {
          name: 'CLS (Layout Shift)',
          value: cls.value.toFixed(2),
          status: cls.value > 0.25 ? 'poor' : 'needs_work',
        },
      }),
      isTechnicalCheck: false,
      pageUrl: audit.url,
      severity: cls.value > 0.25 ? 'critical' : 'medium',
    });
    seenTitles.add('page elements jump around while loading');
  }

  const tbt = metrics['total-blocking-time'];
  if (tbt && typeof tbt.value === 'number' && tbt.value > 200) {
    issues.push({
      id: 'metric_tbt',
      title: 'Page freezes or delays clicks during loading',
      category: 'performance',
      priority: tbt.value > 600 ? 'fix_first' : 'improve_next',
      evidenceKind: 'measured',
      pageSection: 'header',
      problem: `Heavy JavaScript blocks user interaction for ${(tbt.value).toFixed(0)}ms while the browser executes scripts.`,
      whyItMatters: 'When buttons or navigation menus do not respond instantly to taps, users assume the website is broken.',
      recommendedFix: 'Defer non-critical third-party analytics, chat widgets, and scripts until after the main page is displayed.',
      metricEvidence: {
        name: 'TBT (Blocking Time)',
        value: `${(tbt.value).toFixed(0)}ms`,
        status: tbt.value > 600 ? 'poor' : 'needs_work',
      },
      agentPrompt: generateFindingFixPrompt({
        title: 'Page freezes or delays clicks during loading (TBT)',
        category: 'performance',
        severity: tbt.value > 600 ? 'critical' : 'medium',
        auditUrl: audit.url,
        problem: `Heavy JavaScript blocks user interaction for ${(tbt.value).toFixed(0)}ms while the browser executes scripts.`,
        whyItMatters: 'When buttons or navigation menus do not respond instantly to taps, users assume the website is broken.',
        recommendedFix: 'Defer non-critical third-party analytics, chat widgets, and scripts until after the main page is displayed.',
        selector: null,
        elementText: null,
        metricEvidence: {
          name: 'TBT (Blocking Time)',
          value: `${(tbt.value).toFixed(0)}ms`,
          status: tbt.value > 600 ? 'poor' : 'needs_work',
        },
      }),
      isTechnicalCheck: false,
      pageUrl: audit.url,
      severity: tbt.value > 600 ? 'critical' : 'medium',
    });
    seenTitles.add('page freezes or delays clicks during loading');
  }

  // 2. Process Findings (DOM inspections & Lighthouse diagnostics)
  const rawFindings = Array.isArray(audit?.findings) ? audit.findings : [];

  for (const f of rawFindings) {
    const simplifiedTitle = translateTitle(f.title, f.id);
    const titleKey = simplifiedTitle.toLowerCase();

    // Deduplicate overlapping findings
    if (seenTitles.has(titleKey)) continue;
    seenTitles.add(titleKey);

    const evidence = (f.evidence || {}) as Record<string, unknown>;
    const selector = typeof evidence.selector === 'string' ? evidence.selector : null;
    const elementText = typeof evidence.text === 'string' ? evidence.text : null;

    // Categorization
    let category: IssueCategory = 'usability';
    if (f.category === 'performance') category = 'performance';
    else if (f.category === 'seo') category = 'seo';
    else if (f.category === 'accessibility') category = 'accessibility';
    else if (f.category === 'content') category = 'seo';

    // Check if this is a minor technical check
    const isTechCheck =
      f.severity === 'info' ||
      f.id.includes('canonical') ||
      f.id.includes('doctype') ||
      f.id.includes('charset') ||
      f.id.includes('viewport-tag');

    // Priority derivation
    let priority: IssuePriority = 'improve_next';
    if (f.severity === 'critical' || f.id.includes('missing_h1') || f.id.includes('missing_title') || f.id.includes('contrast')) {
      priority = 'fix_first';
    } else if (f.severity === 'low' || f.severity === 'info' || isTechCheck) {
      priority = 'optional';
    }

    const problem = deriveProblem(f, simplifiedTitle);
    const whyItMatters = deriveWhyItMatters(f, problem, simplifiedTitle);
    const recommendedFix = deriveRecommendedFix(f, simplifiedTitle);
    const pageSection = derivePageSection(selector, simplifiedTitle, f);

    const agentPrompt = generateFindingFixPrompt({
      title: simplifiedTitle,
      category,
      severity: f.severity || 'medium',
      auditUrl: audit.url,
      problem,
      whyItMatters,
      recommendedFix,
      selector,
      elementText,
      metricEvidence: null,
      originalFinding: f,
    });

    issues.push({
      id: f.id,
      title: simplifiedTitle,
      category,
      priority,
      evidenceKind: selector ? 'observed' : f.source === 'lighthouse' ? 'measured' : 'suggested',
      pageSection,
      problem,
      whyItMatters,
      recommendedFix,
      selector,
      elementText,
      metricEvidence: null,
      suggestedReplacement: null,
      agentPrompt,
      isTechnicalCheck: isTechCheck,
      originalFinding: f,
      pageUrl: audit.url,
      severity: f.severity || 'medium',
    });
  }

  // Separate non-technical meaningful issues from routine technical checks
  const meaningfulIssues = issues.filter((i) => !i.isTechnicalCheck);
  const routineChecks = issues.filter((i) => i.isTechnicalCheck);

  const fixFirst = meaningfulIssues.filter((i) => i.priority === 'fix_first');
  const improveNext = meaningfulIssues.filter((i) => i.priority === 'improve_next');
  const optional = meaningfulIssues.filter((i) => i.priority === 'optional');

  // Top 3 highest-priority issues
  const top3Issues = [...fixFirst, ...improveNext, ...optional].slice(0, 3);

  // Overall assessment sentence
  const totalCount = meaningfulIssues.length;
  let assessmentText = `Your website has ${totalCount} issue${totalCount !== 1 ? 's' : ''} worth fixing.`;
  if (fixFirst.length > 0) {
    assessmentText = `Your website needs immediate attention in ${fixFirst.length} important area${fixFirst.length !== 1 ? 's' : ''}.`;
  } else if (totalCount === 0) {
    assessmentText = 'Your website is in strong shape with no critical defects detected.';
  }

  // Recommended next step
  let recommendedNextStep = 'Review the issues below and apply the recommended fixes.';
  if (top3Issues.length > 0) {
    recommendedNextStep = `Start by resolving: "${top3Issues[0].title}".`;
  }

  return {
    assessmentText,
    recommendedNextStep,
    totalIssuesCount: totalCount,
    top3Issues,
    fixFirst,
    improveNext,
    optional,
    routineChecks,
  };
}
