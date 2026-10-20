import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompleteRedesign,
  buildImplementationPrompt,
} from '../src/services/redesign.ts';
import type { AuditResponse } from '../src/types/api.ts';
import type { MeaningfulIssue } from '../src/services/intelligence.ts';

test('redesign: builds complete proposed page model from audit snapshot', () => {
  const mockAudit: AuditResponse = {
    audit_id: 'test-audit-123',
    url: 'https://acme-analytics.com/product',
    strategy: 'desktop',
    page_snapshot: {
      url: 'https://acme-analytics.com/product',
      status_code: 200,
      content_type: 'text/html',
      title: 'Acme Analytics — Real-time Web Intelligence',
      meta_description: 'Fast, privacy-friendly website analytics for modern software teams.',
      canonical: 'https://acme-analytics.com/product',
      headings: {
        h1: ['Turn Website Traffic Into Actionable Insights'],
        h2: ['Instant Event Tracking', 'Privacy First Analytics', 'Custom Dashboards'],
        h3: ['Lightweight Script', 'Real-time Visitors'],
        h4: [],
        h5: [],
        h6: [],
      },
      images: [
        {
          src: 'https://acme-analytics.com/hero.png',
          alt: 'Dashboard overview showing active visitors',
        },
      ],
      links: [
        { text: 'Features', href: '/features' },
        { text: 'Pricing', href: '/pricing' },
        { text: 'Documentation', href: '/docs' },
      ],
      buttons: [{ text: 'Start Free Trial', type: 'submit' }],
      text_excerpt: 'Track visitors in real time without cookies or complex tracking scripts.',
      html_bytes: 42000,
    },
    findings: [],
    pagespeed: null,
    summary: { finding_count: 0, by_category: {} },
  };

  const mockIssues: MeaningfulIssue[] = [
    {
      id: 'issue-1',
      title: 'Main headline loads too slowly',
      problem: 'The hero headline takes 4.2 seconds to display.',
      whyItMatters: 'Visitors abandon slow loading pages.',
      recommendedFix: 'Preload fonts and optimize CSS critical path.',
      category: 'performance',
      priority: 'fix_first',
      evidenceKind: 'measured',
      selector: 'h1.hero-title',
      pageSection: 'hero',
    },
    {
      id: 'issue-2',
      title: 'Low contrast navigation links',
      problem: 'Navigation links have 2.8:1 contrast ratio.',
      whyItMatters: 'Fails WCAG 2.1 AA accessibility guidelines.',
      recommendedFix: 'Use darker slate-800 text color.',
      category: 'accessibility',
      priority: 'fix_first',
      evidenceKind: 'measured',
      selector: 'nav a.nav-link',
      pageSection: 'header',
    },
  ];

  const model = buildCompleteRedesign(mockAudit, mockIssues);

  // 1. Verify Brand & Identity preservation
  assert.equal(model.brandName, 'Acme Analytics');
  assert.ok(model.tagline.includes('Fast, privacy-friendly website analytics'));

  // 2. Verify Complete Page Structure
  assert.ok(model.navLinks.length >= 3);
  assert.equal(model.ctaButtonText, 'Start Free Trial');

  // Hero
  assert.equal(model.hero.headline, 'Turn Website Traffic Into Actionable Insights');
  assert.equal(model.hero.primaryCta, 'Start Free Trial');
  assert.equal(model.hero.imageSrc, 'https://acme-analytics.com/hero.png');

  // Features
  assert.ok(model.features.length >= 3);
  assert.equal(model.features[0].title, 'Instant Event Tracking');

  // CTA Banner & Footer
  assert.ok(model.ctaBanner.heading.includes('Acme Analytics'));
  assert.ok(model.footer.copyright.includes('Acme Analytics'));
  assert.equal(model.summary.isFullPageRedesign, true);
  assert.equal(model.summary.totalResolvedCount, 2);
});

test('redesign: generates comprehensive 6-part AI coding agent implementation prompt', () => {
  const mockAudit: AuditResponse = {
    audit_id: 'test-audit-456',
    url: 'https://example-shop.com',
    strategy: 'mobile',
    page_snapshot: {
      url: 'https://example-shop.com',
      status_code: 200,
      content_type: 'text/html',
      title: 'Example Shop',
      meta_description: 'Buy handcrafted ceramics and homeware.',
      canonical: null,
      headings: {
        h1: ['Handcrafted Ceramics for Everyday Living'],
        h2: ['Featured Collections', 'Customer Reviews'],
        h3: [],
        h4: [],
        h5: [],
        h6: [],
      },
      images: [],
      links: [{ text: 'Shop All', href: '/shop' }],
      buttons: [{ text: 'Explore Collection' }],
      text_excerpt: 'Thoughtfully crafted tableware handmade in Portugal.',
      html_bytes: 25000,
    },
    findings: [],
    pagespeed: null,
    summary: { finding_count: 0, by_category: {} },
  };

  const mockIssues: MeaningfulIssue[] = [
    {
      id: 'issue-alt',
      title: 'Missing image alt text',
      problem: 'Product image lacks alternative text.',
      whyItMatters: 'Screen reader users cannot identify the item.',
      recommendedFix: 'Add descriptive alt="Handmade ceramic vase".',
      category: 'accessibility',
      priority: 'fix_first',
      evidenceKind: 'measured',
      selector: 'img.product-hero',
      elementText: '',
      pageSection: 'media',
    },
  ];

  const model = buildCompleteRedesign(mockAudit, mockIssues);

  const prompt = buildImplementationPrompt({
    url: 'https://example-shop.com',
    strategy: 'mobile',
    redesign: model,
    selectedIssues: mockIssues,
    frameworkHint: 'Next.js 14 with Tailwind CSS',
  });

  // Verify all 6 mandatory sections are present
  assert.ok(prompt.includes('## 1. Project Context'));
  assert.ok(prompt.includes('https://example-shop.com'));
  assert.ok(prompt.includes('Next.js 14 with Tailwind CSS'));

  assert.ok(prompt.includes('## 2. Problems to Fix (Audited Evidence)'));
  assert.ok(prompt.includes('Missing image alt text'));
  assert.ok(prompt.includes('img.product-hero'));

  assert.ok(prompt.includes('## 3. Proposed Redesign Specifications'));
  assert.ok(prompt.includes('Handcrafted Ceramics for Everyday Living'));

  assert.ok(prompt.includes('## 4. Implementation Constraints'));
  assert.ok(prompt.includes('Never Replace with Static Mockups'));
  assert.ok(prompt.includes('Preserve Business Logic & Links'));

  assert.ok(prompt.includes('## 5. Acceptance Criteria'));
  assert.ok(prompt.includes('touch targets ≥ 48px'));

  assert.ok(prompt.includes('## 6. Verification Steps'));
  assert.ok(prompt.includes('Compare the final rendered page against this specification'));
});
