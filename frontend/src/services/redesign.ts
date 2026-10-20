'use strict';

import type { AuditResponse, Finding } from '@/types/api';
import type { MeaningfulIssue } from '@/services/intelligence';

export interface CompleteRedesignModel {
  brandName: string;
  tagline: string;
  navLinks: { text: string; href: string }[];
  ctaButtonText: string;
  hero: {
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
    badgeText: string;
    imageSrc?: string | null;
    imageAlt: string;
    resolvedIssues: string[];
  };
  features: {
    id: string;
    title: string;
    description: string;
    icon: 'zap' | 'shield' | 'sparkles' | 'layers' | 'globe' | 'check';
    resolvedIssues: string[];
  }[];
  mediaShowcase: {
    title: string;
    description: string;
    images: {
      src?: string | null;
      alt: string;
      caption: string;
    }[];
    resolvedIssues: string[];
  };
  ctaBanner: {
    heading: string;
    subheading: string;
    primaryButton: string;
    secondaryButton: string;
    resolvedIssues: string[];
  };
  footer: {
    brandText: string;
    copyright: string;
    columns: {
      title: string;
      links: { text: string; href: string }[];
    }[];
    accessibilityNote: string;
    resolvedIssues: string[];
  };
  summary: {
    totalResolvedCount: number;
    resolvedCategories: string[];
    keyImprovements: string[];
    isFullPageRedesign: boolean;
  };
}

/**
 * Extracts a clean brand name from a URL or page title.
 */
function extractBrandName(url: string, pageTitle?: string | null): string {
  if (pageTitle && pageTitle.trim().length > 0) {
    const parts = pageTitle.split(/[-–—|•:]/);
    if (parts[0] && parts[0].trim().length > 0 && parts[0].trim().length < 40) {
      return parts[0].trim();
    }
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const name = host.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return 'Website';
  }
}

/**
 * Derives a clean tagline from meta description, headings, or excerpt.
 */
function extractTagline(audit: AuditResponse): string {
  const meta = audit.page_snapshot?.meta_description;
  if (meta && meta.trim().length > 10) {
    return meta.trim();
  }
  const h2 = audit.page_snapshot?.headings?.h2?.[0];
  if (h2 && h2.trim().length > 10 && h2.trim().length < 120) {
    return h2.trim();
  }
  const excerpt = audit.page_snapshot?.text_excerpt;
  if (excerpt && excerpt.trim().length > 10) {
    const firstSentence = excerpt.split('.')[0];
    if (firstSentence && firstSentence.trim().length < 140) {
      return firstSentence.trim() + '.';
    }
  }
  return 'A modern, accessible, and high-performance web experience built for users.';
}

/**
 * Constructs the complete proposed redesign model from audited real data.
 */
export function buildCompleteRedesign(
  audit: AuditResponse,
  issues: MeaningfulIssue[] = []
): CompleteRedesignModel {
  const brandName = extractBrandName(audit.url, audit.page_snapshot?.title);
  const tagline = extractTagline(audit);

  // 1. Navigation Links
  const rawLinks = audit.page_snapshot?.links || [];
  const cleanNavLinks: { text: string; href: string }[] = [];
  const seenNav = new Set<string>();

  for (const l of rawLinks) {
    const txt = (l.text || '').trim();
    const href = (l.href || '').trim();
    if (
      txt.length > 1 &&
      txt.length < 24 &&
      !seenNav.has(txt.toLowerCase()) &&
      !['login', 'sign in', 'cookie', 'privacy', 'terms', 'skip to content'].includes(txt.toLowerCase())
    ) {
      seenNav.add(txt.toLowerCase());
      cleanNavLinks.push({ text: txt, href: href.startsWith('http') || href.startsWith('/') ? href : '#' });
    }
    if (cleanNavLinks.length >= 5) break;
  }

  if (cleanNavLinks.length < 3) {
    cleanNavLinks.push(
      { text: 'Features', href: '#features' },
      { text: 'Overview', href: '#overview' },
      { text: 'Resources', href: '#resources' }
    );
  }

  // Find primary button text
  const rawButtons = audit.page_snapshot?.buttons || [];
  const primaryButtonCandidate = rawButtons.find(
    (b) => b.text && b.text.trim().length > 0 && b.text.trim().length < 24
  )?.text?.trim();
  const ctaButtonText = primaryButtonCandidate || 'Get Started';

  // 2. Hero Section
  const rawH1 = audit.page_snapshot?.headings?.h1?.[0];
  const headline =
    rawH1 && rawH1.trim().length > 5
      ? rawH1.trim()
      : `${brandName} — Clear, Fast & User-Focused Experience`;

  const heroIssues = issues
    .filter((i) => i.pageSection === 'hero' || i.pageSection === 'header' || i.id.includes('lcp'))
    .map((i) => i.title);

  const heroImageSrc = audit.page_snapshot?.images?.[0]?.src;
  const heroImageAlt =
    audit.page_snapshot?.images?.[0]?.alt && audit.page_snapshot.images[0].alt.trim().length > 3
      ? audit.page_snapshot.images[0].alt.trim()
      : `${brandName} platform overview and interface display`;

  // 3. Features Section (derived from H2/H3 or key content)
  const rawH2s = (audit.page_snapshot?.headings?.h2 || []).filter(
    (h) => h.trim().length > 5 && h.trim().length < 60
  );
  const rawH3s = (audit.page_snapshot?.headings?.h3 || []).filter(
    (h) => h.trim().length > 5 && h.trim().length < 60
  );
  const allSubheadings = [...rawH2s, ...rawH3s];

  const icons: ('zap' | 'shield' | 'sparkles' | 'layers' | 'globe' | 'check')[] = [
    'zap',
    'shield',
    'sparkles',
    'layers',
    'globe',
    'check',
  ];

  const features: CompleteRedesignModel['features'] = [];
  const defaultFeatures = [
    {
      title: 'High-Performance & Instant Loading',
      desc: 'Optimized asset delivery, zero layout shift (CLS), and prioritized largest contentful paint.',
    },
    {
      title: 'Accessible & Universal Design',
      desc: 'WCAG AAA contrast ratios, clear focus rings, and semantic headings readable by any device.',
    },
    {
      title: 'Intuitive Navigation & Clarity',
      desc: 'Clear visual hierarchy guiding visitors effortlessly to key actions without cognitive overload.',
    },
    {
      title: 'Responsive Cross-Device Layout',
      desc: 'Fluid layouts tested across desktop and mobile screens with generous touch targets.',
    },
  ];

  const featureCount = Math.max(3, Math.min(6, allSubheadings.length || 4));
  for (let idx = 0; idx < featureCount; idx++) {
    const title = allSubheadings[idx] || defaultFeatures[idx % defaultFeatures.length].title;
    const desc = defaultFeatures[idx % defaultFeatures.length].desc;
    features.push({
      id: `feat-${idx + 1}`,
      title,
      description: desc,
      icon: icons[idx % icons.length],
      resolvedIssues: idx === 0 ? ['Contrast ratios improved', 'Visual spacing normalized'] : [],
    });
  }

  // 4. Media & Visual Content Showcase
  const mediaImages = (audit.page_snapshot?.images || [])
    .filter((img) => img.src && !img.src.includes('data:image/svg'))
    .slice(0, 3)
    .map((img, i) => ({
      src: img.src,
      alt: img.alt?.trim() ? img.alt.trim() : `${brandName} feature demonstration ${i + 1}`,
      caption: img.alt?.trim() ? img.alt.trim() : `Optimized asset with responsive dimensions and lazy loading`,
    }));

  // 5. Call To Action Banner
  const ctaIssues = issues
    .filter((i) => i.pageSection === 'cta')
    .map((i) => i.title);

  // 6. Footer
  const footerIssues = issues
    .filter((i) => i.pageSection === 'footer')
    .map((i) => i.title);

  const currentYear = new Date().getFullYear();

  // Summary of improvements
  const keyImprovements: string[] = [];
  if (issues.some((i) => i.category === 'performance')) {
    keyImprovements.push('Main content load speed (LCP) optimized with preloaded assets & clean layout');
  }
  if (issues.some((i) => i.category === 'accessibility')) {
    keyImprovements.push('Universal accessibility: WCAG AAA text contrast, touch targets ≥ 48px, aria labels');
  }
  if (issues.some((i) => i.category === 'seo')) {
    keyImprovements.push('Semantic heading structure (H1 → H2 → H3) and descriptive metadata');
  }
  if (issues.some((i) => i.category === 'usability')) {
    keyImprovements.push('Restructured visual hierarchy with prominent value proposition and single clear CTA');
  }
  if (keyImprovements.length === 0) {
    keyImprovements.push(
      'Streamlined visual hierarchy and modern spacing',
      'High-contrast accessible controls and semantic structure',
      'Responsive full-page layout without horizontal overflow'
    );
  }

  const resolvedCategories = Array.from(new Set(issues.map((i) => i.category)));

  return {
    brandName,
    tagline,
    navLinks: cleanNavLinks,
    ctaButtonText,
    hero: {
      headline,
      subheadline: tagline,
      primaryCta: ctaButtonText,
      secondaryCta: 'Learn More',
      badgeText: 'New & Improved Experience',
      imageSrc: heroImageSrc,
      imageAlt: heroImageAlt,
      resolvedIssues: heroIssues,
    },
    features,
    mediaShowcase: {
      title: 'Designed for Clarity & Speed',
      description: 'Every element has been refined to eliminate visual clutter and guide user attention.',
      images: mediaImages,
      resolvedIssues: ['Images provided with explicit aspect ratios and descriptive alt tags'],
    },
    ctaBanner: {
      heading: `Experience the new ${brandName}`,
      subheading: 'Built with modern accessibility, fast performance, and responsive design.',
      primaryButton: ctaButtonText,
      secondaryButton: 'Contact Us',
      resolvedIssues: ctaIssues,
    },
    footer: {
      brandText: `${brandName} — Dedicated to providing a clear, accessible, and fast web experience.`,
      copyright: `© ${currentYear} ${brandName}. All rights reserved.`,
      columns: [
        {
          title: 'Product',
          links: cleanNavLinks.slice(0, 3),
        },
        {
          title: 'Resources',
          links: [
            { text: 'Documentation', href: '#' },
            { text: 'Accessibility Statement', href: '#' },
            { text: 'Status', href: '#' },
          ],
        },
      ],
      accessibilityNote: 'This redesigned proposal complies with WCAG 2.1 AA accessibility standards.',
      resolvedIssues: footerIssues,
    },
    summary: {
      totalResolvedCount: issues.length,
      resolvedCategories,
      keyImprovements,
      isFullPageRedesign: true,
    },
  };
}

/**
 * Builds the comprehensive implementation prompt for an AI coding agent.
 */
export function buildImplementationPrompt(options: {
  url: string;
  strategy: 'mobile' | 'desktop';
  redesign: CompleteRedesignModel;
  selectedIssues: MeaningfulIssue[];
  frameworkHint?: string;
}): string {
  const { url, strategy, redesign, selectedIssues, frameworkHint } = options;

  const lines: string[] = [];

  // Header
  lines.push(`# Implementation Prompt: Full-Page Website Redesign`);
  lines.push(
    `You are an expert full-stack web developer and UI/UX engineer. Implement the approved redesign for the website below, addressing all verified audit findings while preserving the site's identity, content, and working functionality.\n`
  );

  // 1. Project Context
  lines.push(`## 1. Project Context`);
  lines.push(`- **Target Website URL:** ${url}`);
  lines.push(`- **Primary Viewport Strategy:** ${strategy.toUpperCase()}`);
  lines.push(`- **Website Brand:** ${redesign.brandName}`);
  lines.push(`- **Website Purpose:** ${redesign.tagline}`);
  if (frameworkHint) {
    lines.push(`- **Detected Framework / Environment:** ${frameworkHint}`);
  }
  lines.push(`- **Redesign Scope:** Complete page redesign (Header, Hero, Features, Media, CTA Banner, Footer)\n`);

  // 2. Problems to Fix (Ground Truth from Audit)
  lines.push(`## 2. Problems to Fix (Audited Evidence)`);
  if (selectedIssues.length === 0) {
    lines.push(`No specific issues selected. Implement general visual hierarchy and responsive improvements.`);
  } else {
    selectedIssues.forEach((issue, idx) => {
      lines.push(`### Issue ${idx + 1}: ${issue.title} [${issue.priority.toUpperCase()}]`);
      lines.push(`- **Category:** ${issue.category}`);
      lines.push(`- **Problem:** ${issue.problem}`);
      lines.push(`- **Why it matters:** ${issue.whyItMatters}`);
      if (issue.selector) {
        lines.push(`- **Target Selector / DOM:** \`${issue.selector}\``);
      }
      if (issue.elementText) {
        lines.push(`- **Observed Text:** "${issue.elementText}"`);
      }
      lines.push(`- **Recommended Change:** ${issue.recommendedFix}`);
      lines.push('');
    });
  }

  // 3. Proposed Improvements & Specifications
  lines.push(`## 3. Proposed Redesign Specifications`);
  lines.push(`### Layout & Visual Hierarchy`);
  lines.push(`- **Header & Navigation:** Modern sticky or top-fixed navigation bar featuring brand "${redesign.brandName}", accessible navigation links (${redesign.navLinks.map((l) => l.text).join(', ')}), and a high-contrast primary CTA "${redesign.ctaButtonText}".`);
  lines.push(`- **Hero Section:**`);
  lines.push(`  - Headline: "${redesign.hero.headline}" (rendered as clean, semantic <h1>).`);
  lines.push(`  - Subtitle: "${redesign.hero.subheadline}".`);
  lines.push(`  - Primary CTA: "${redesign.hero.primaryCta}" with minimum touch target of 48px.`);
  lines.push(`  - Secondary Action: "${redesign.hero.secondaryCta}".`);
  if (redesign.hero.imageSrc) {
    lines.push(`  - Hero Image: Proper aspect ratio container with explicit width/height to prevent layout shifts (CLS), and descriptive alt text: "${redesign.hero.imageAlt}".`);
  }
  lines.push(`- **Features Grid:** Structured responsive grid (1 column on mobile, 3 columns on desktop) displaying:`);
  redesign.features.forEach((f) => {
    lines.push(`  - **${f.title}:** ${f.description}`);
  });
  lines.push(`- **Call To Action Banner:** Focused conversion banner with heading "${redesign.ctaBanner.heading}" and primary action button.`);
  lines.push(`- **Footer:** Semantic <footer> with brand description, structured columns, copyright, and accessibility statement.`);
  lines.push(`- **Typography & Colors:** Clean, legible font hierarchy, WCAG 2.1 AA compliant color contrast (minimum 4.5:1 for normal text, 3:1 for large text and UI components), and consistent spacing scale (4px/8px grid).\n`);

  // 4. Implementation Constraints
  lines.push(`## 4. Implementation Constraints`);
  lines.push(`1. **Inspect Before Modifying:** Inspect existing codebase structure, dependencies, and styles before changing any files.`);
  lines.push(`2. **Reuse Existing Patterns:** Reuse existing project UI components, utility classes, and naming conventions whenever appropriate.`);
  lines.push(`3. **Never Replace with Static Mockups:** Do not replace dynamic application logic, routing, or state with dummy static HTML.`);
  lines.push(`4. **Preserve Business Logic & Links:** All existing working functionality, navigation paths, and API integrations must remain intact.`);
  lines.push(`5. **No Unrelated Refactors:** Focus strictly on the required visual, accessibility, and performance improvements.`);
  lines.push(`6. **Responsive by Default:** Ensure zero horizontal scrollbars or overflow at both 390px (mobile) and 1280px (desktop) viewport widths.\n`);

  // 5. Acceptance Criteria
  lines.push(`## 5. Acceptance Criteria`);
  lines.push(`- [ ] Semantic H1 exists and clearly communicates the page purpose.`);
  lines.push(`- [ ] All images have descriptive \`alt\` attributes and explicit aspect ratio constraints.`);
  lines.push(`- [ ] Interactive elements (buttons, links) have accessible focus rings and touch targets ≥ 48px.`);
  lines.push(`- [ ] Color contrast meets or exceeds WCAG 2.1 AA requirements.`);
  lines.push(`- [ ] Mobile view renders cleanly without horizontal scrolling or clipped text.`);
  lines.push(`- [ ] Selected audit findings from Section 2 are completely resolved.`);
  lines.push(`- [ ] Existing build step passes without errors or linting warnings.\n`);

  // 6. Verification Steps for Agent
  lines.push(`## 6. Verification Steps`);
  lines.push(`1. Run the local build command to verify zero TypeScript or syntax errors.`);
  lines.push(`2. Render the page at desktop (1280px) and mobile (390px) widths and inspect visual hierarchy.`);
  lines.push(`3. Run accessibility checks to confirm no contrast or missing alt violations remain.`);
  lines.push(`4. Compare the final rendered page against this specification and report any remaining discrepancies.`);

  return lines.join('\n');
}
