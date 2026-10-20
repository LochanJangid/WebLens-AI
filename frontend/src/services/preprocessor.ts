import type { Finding, ExplainedFinding, PageSnapshot } from '../types/api.ts';

/**
 * Token Efficiency and Preprocessing Configuration
 */
export const TOKEN_BUDGET_CONFIG = {
  maxBatchSize: 6,
  maxHtmlExcerptBytes: 4000,
  maxTextEvidenceChars: 300,
  maxConversationTurns: 8,
  cacheTtlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  cacheVersion: 'v2',
  modelIdentifier: 'openai/gpt-oss-120b',
};

/**
 * Deterministic Level 1 lightweight explanations for common verified issues.
 * These require zero LLM tokens and incorporate actual inspected page evidence.
 */
export function getLightweightExplanation(
  finding: Finding
): ExplainedFinding | null {
  const fid = finding.id || '';
  const evidence = finding.evidence || {};
  const selector = (evidence.selector as string) || 'HTML document';

  // 1. Missing Title
  if (fid.includes('missing_title')) {
    return {
      id: finding.id,
      title: finding.title,
      category: 'seo',
      classification: 'verified_defect',
      severity: 'high',
      selector: 'head > title',
      explanation:
        'The page is missing a <title> tag inside the <head> section. Search engines and browser tabs rely on the title to identify what the page offers. Without it, users may bounce and search engines will substitute an unoptimized guess.',
      steps: [
        'Open your layout template or page HTML (e.g., index.html or CMS page settings).',
        'Inside the <head> element, add: <title>Your Brand – Primary Service or Purpose</title>.',
        'Keep the title between 40 and 60 characters for optimal search snippet display.',
        'Save and reload the page to verify that the browser tab displays your new title.',
      ],
      example: '<title>CleanCraft – Professional Home Cleaning Services</title>',
      impact: 'Immediate SEO snippet clarity and improved user trust in search results.',
      confidence: 'high',
      verification: 'Inspect the browser tab title or view page source to confirm <title> exists.',
    };
  }

  // 2. Long Title
  if (fid.includes('long_title')) {
    const charCount = (evidence.character_count as number) || (evidence.text as string)?.length || 0;
    const currentTitle = (evidence.text as string) || '';
    return {
      id: finding.id,
      title: finding.title,
      category: 'seo',
      classification: 'potential_issue',
      severity: 'low',
      selector: 'head > title',
      explanation: `The current page title is ${charCount} characters long. While modern search engines accept longer titles, they typically truncate snippets around 60 characters with an ellipsis (...).`,
      steps: [
        'Review the current title: "' + currentTitle.slice(0, 100) + '"',
        'Front-load the most relevant keywords and brand name at the start.',
        'Trim redundant marketing taglines from the end to keep it under 60 characters.',
      ],
      example: '<title>Core Keyword | Brand Name</title>',
      impact: 'Prevents search results from truncating your key proposition.',
      confidence: 'high',
      verification: 'Run an SEO preview tool or check character count in code.',
    };
  }

  // 3. Missing Meta Description
  if (fid.includes('missing_meta_description')) {
    return {
      id: finding.id,
      title: finding.title,
      category: 'seo',
      classification: 'verified_defect',
      severity: 'medium',
      selector: 'head meta[name="description"]',
      explanation:
        'No meta description tag was detected in the <head>. While search engines can generate automatic snippets from body copy, providing an explicit 140–160 character description gives you direct control over your search result snippet.',
      steps: [
        'Locate the <head> section of the template or page SEO metadata editor.',
        'Add a <meta name="description" content="..."> tag.',
        'Write 1 to 2 clear sentences describing the unique service, product, or information this page offers.',
      ],
      example:
        '<meta name="description" content="Discover professional web audit tools and AI prompts to optimize your website performance, SEO, and conversion rate.">',
      impact: 'Higher organic search click-through rate (CTR) and clearer search snippets.',
      confidence: 'high',
      verification: 'View page source and verify <meta name="description"> is present.',
    };
  }

  // 4. Missing H1 Main Heading
  if (fid.includes('missing_h1')) {
    return {
      id: finding.id,
      title: finding.title,
      category: 'content',
      classification: 'verified_defect',
      severity: 'medium',
      selector: 'h1',
      explanation:
        'The page markup does not contain an <h1> tag. Assistive technologies (screen readers) and search engines use <h1> as the primary outline anchor for the entire page topic.',
      steps: [
        'Identify the most prominent headline in your hero or main content section.',
        'Change its container tag to <h1>...</h1> or add a visible <h1> above the main text.',
        'Ensure the text describes the core value proposition of this specific page.',
        'Style the <h1> with CSS classes rather than relying on heading tags for font size.',
      ],
      example: '<h1>Affordable Website Maintenance for Small Businesses</h1>',
      impact: 'Improves accessibility navigation for screen readers and strengthens topical SEO relevance.',
      confidence: 'high',
      verification: 'Open DevTools (F12) Elements panel and confirm a single visible <h1> exists.',
    };
  }

  // 5. Multiple H1 Headings
  if (fid.includes('multiple_h1')) {
    const headings = (evidence.observed_headings as string[]) || [];
    return {
      id: finding.id,
      title: finding.title,
      category: 'content',
      classification: 'needs_review',
      severity: 'low',
      selector: 'h1',
      explanation: `Found ${headings.length || 'multiple'} <h1> elements on the page. While modern HTML5 allows multiple h1s in sectioning elements, having competing top-level headings can blur the page's primary focus.`,
      steps: [
        'Review the detected headings to determine which one represents the overall page topic.',
        'Keep only that primary topic as an <h1>.',
        'Demote subordinate section titles from <h1> to <h2> or <h3>.',
      ],
      example: 'Convert secondary <h1>Section Title</h1> to <h2>Section Title</h2>',
      impact: 'Cleaner document outline for assistive technologies and search crawlers.',
      confidence: 'medium',
      verification: 'Inspect DOM to verify one primary <h1> with subordinate <h2> sections.',
    };
  }

  // 6. Missing Alt Text on Images
  if (fid.includes('missing_alt')) {
    const count = (evidence.count as number) || (evidence.examples as unknown[])?.length || 0;
    return {
      id: finding.id,
      title: finding.title,
      category: 'accessibility',
      classification: 'verified_defect',
      severity: 'medium',
      selector: 'img:not([alt])',
      explanation: `${count > 0 ? `${count} images lack` : 'Images lack'} an alt attribute. Screen readers announce missing alt images as raw URLs, and users on low-bandwidth connections cannot understand what was shown.`,
      steps: [
        'Inspect each affected <img> element.',
        'For informative images, add descriptive alt text: alt="Description of what is shown".',
        'For purely decorative graphics or background patterns, add an empty attribute: alt="".',
      ],
      example: '<img src="/team.jpg" alt="Our dental support team in front of the clinic">',
      impact: 'WCAG 2.1 Level A compliance and improved user experience for visually impaired visitors.',
      confidence: 'high',
      verification: 'Run screen reader test or verify in DevTools that all <img> tags have alt attributes.',
    };
  }

  // 7. Ambiguous or Empty Link Text
  if (fid.includes('ambiguous_links') || fid.includes('empty_link')) {
    return {
      id: finding.id,
      title: finding.title,
      category: 'ux',
      classification: 'verified_defect',
      severity: 'low',
      selector: 'a[href]',
      explanation:
        'Links without visible text (e.g. icon-only buttons or empty anchor tags) prevent assistive technologies from announcing their destination to the user.',
      steps: [
        'Find the affected <a> elements.',
        'Add descriptive visible text inside the link where feasible.',
        'If the link is an icon-only button, add an aria-label attribute describing its destination (e.g., aria-label="Visit our Twitter profile").',
      ],
      example: '<a href="/pricing" aria-label="View pricing plans">...</a>',
      impact: 'Accessible navigation for keyboard and screen reader users.',
      confidence: 'high',
      verification: 'Tab through the page using the keyboard and verify each link is announced properly.',
    };
  }

  // Not a deterministic template -> requires Level 2 Groq AI interpretation
  return null;
}

/**
 * Strips redundant, bloated data from findings to reduce LLM input tokens by 70–85%.
 */
export function filterFindingsForLlm(
  findings: Finding[],
  maxCount = TOKEN_BUDGET_CONFIG.maxBatchSize
): Array<Record<string, unknown>> {
  const seenKeys = new Set<string>();
  const filtered: Array<Record<string, unknown>> = [];

  for (const f of findings) {
    // Exclude passed or purely informational non-issues
    if (f.severity === 'info' && f.classification === 'recommendation') {
      continue;
    }

    // Deduplicate by title + selector
    const selector = typeof f.evidence?.selector === 'string' ? f.evidence.selector : '';
    const dedupeKey = `${f.title.trim().toLowerCase()}::${selector.trim().toLowerCase()}`;
    if (seenKeys.has(dedupeKey)) {
      continue;
    }
    seenKeys.add(dedupeKey);

    // Build lean finding object
    const leanEvidence: Record<string, unknown> = {};
    if (selector) leanEvidence.selector = selector;
    if (f.evidence?.text) {
      leanEvidence.text = String(f.evidence.text).slice(0, TOKEN_BUDGET_CONFIG.maxTextEvidenceChars);
    }
    if (f.evidence?.observed) {
      leanEvidence.observed = String(f.evidence.observed).slice(0, TOKEN_BUDGET_CONFIG.maxTextEvidenceChars);
    }
    if (typeof f.evidence?.count === 'number') {
      leanEvidence.count = f.evidence.count;
    }

    filtered.push({
      id: f.id,
      title: f.title,
      category: f.category,
      severity: f.severity,
      classification: f.classification,
      evidence: leanEvidence,
      why_it_matters: f.why_it_matters.slice(0, 250),
      suggested_change: f.suggested_change.slice(0, 250),
      implementation_hint: f.implementation_hint.slice(0, 250),
      verification: f.verification.slice(0, 200),
      source: f.source,
    });

    if (filtered.length >= maxCount) {
      break;
    }
  }

  return filtered;
}

/**
 * Creates a deterministic cache key for an explanation request.
 */
export function getExplanationCacheKey(finding: Finding): string {
  const selector = typeof finding.evidence?.selector === 'string' ? finding.evidence.selector : '';
  const text = typeof finding.evidence?.text === 'string' ? finding.evidence.text : '';
  const contentHash = `${finding.id}_${finding.title}_${selector}_${text}`;
  return `weblens_exp_${TOKEN_BUDGET_CONFIG.cacheVersion}_${TOKEN_BUDGET_CONFIG.modelIdentifier}_${hashString(contentHash)}`;
}

/**
 * Simple fast string hash.
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * In-memory & localStorage client-side cache for AI explanations.
 */
export const explanationCache = {
  get(key: string): ExplainedFinding | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > TOKEN_BUDGET_CONFIG.cacheTtlMs) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data as ExplainedFinding;
    } catch {
      return null;
    }
  },

  set(key: string, data: ExplainedFinding): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          timestamp: Date.now(),
          data,
        })
      );
    } catch {
      // Storage might be full or private mode
    }
  },
};
