import test from 'node:test';
import assert from 'node:assert/strict';
import {
  processAuditIntelligence,
  groupIssuesBySection,
  derivePageSection,
  generateFindingFixPrompt,
} from '../src/services/intelligence.ts';
import type { AuditResponse } from '../src/types/api.ts';

test('intelligence: processes LCP metric into plain-language high impact issue', () => {
  const mockAudit: AuditResponse = {
    audit_id: 'test-1',
    url: 'https://example.com',
    strategy: 'mobile',
    page_snapshot: {
      url: 'https://example.com',
      status_code: 200,
      content_type: 'text/html',
      title: 'Example',
      meta_description: null,
      canonical: null,
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      images: [],
      links: [],
      buttons: [],
      text_excerpt: '',
      html_bytes: 1000,
    },
    findings: [],
    pagespeed: {
      requested_url: 'https://example.com',
      strategy: 'mobile',
      scores: { performance: { score: 42 } },
      metrics: {
        'largest-contentful-paint': {
          audit_id: 'largest-contentful-paint',
          value: 4800,
          display_value: '4.8 s',
        },
      },
      audit_findings: [],
    },
    summary: { finding_count: 0, by_category: {} },
  };

  const intel = processAuditIntelligence(mockAudit);
  assert.ok(intel.totalIssuesCount >= 1);
  assert.equal(intel.fixFirst.length, 1);
  assert.equal(intel.fixFirst[0].title, 'The main image or headline loads too slowly');
  assert.equal(intel.fixFirst[0].category, 'performance');
  assert.equal(intel.fixFirst[0].priority, 'fix_first');
  assert.ok(intel.fixFirst[0].problem.includes('4.8 seconds'));
  assert.ok(intel.top3Issues.length >= 1);
  assert.ok(intel.assessmentText.includes('needs immediate attention'));
});

test('intelligence: translates technical findings and separates routine checks', () => {
  const mockAudit: AuditResponse = {
    audit_id: 'test-2',
    url: 'https://example.com',
    strategy: 'desktop',
    page_snapshot: {
      url: 'https://example.com',
      status_code: 200,
      content_type: 'text/html',
      title: 'Test',
      meta_description: null,
      canonical: null,
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      images: [],
      links: [],
      buttons: [],
      text_excerpt: '',
      html_bytes: 1000,
    },
    findings: [
      {
        id: 'seo_missing_meta_description',
        category: 'seo',
        classification: 'potential_issue',
        severity: 'medium',
        title: 'Missing meta description',
        page_url: 'https://example.com',
        evidence: {},
        why_it_matters: 'Search engines need a description.',
        suggested_change: 'Add a meta description.',
        implementation_hint: 'Add meta tag',
        verification: 'Check head',
        source: 'html_rule',
      },
      {
        id: 'seo_missing_canonical',
        category: 'seo',
        classification: 'recommendation',
        severity: 'info',
        title: 'Missing canonical link tag',
        page_url: 'https://example.com',
        evidence: {},
        why_it_matters: 'Helpful for canonicalization.',
        suggested_change: 'Add canonical tag.',
        implementation_hint: 'Add link tag',
        verification: 'Check head',
        source: 'html_rule',
      },
    ],
    pagespeed: null,
    summary: { finding_count: 2, by_category: {} },
  };

  const intel = processAuditIntelligence(mockAudit);
  assert.equal(intel.improveNext.length, 1);
  assert.equal(intel.improveNext[0].title, 'Missing page summary for search engines');
  assert.equal(intel.routineChecks.length, 1);
  assert.equal(intel.routineChecks[0].id, 'seo_missing_canonical');
});

test('intelligence: derives page section correctly and groups issues', () => {
  assert.equal(derivePageSection('nav > ul > li', 'Navigation Menu'), 'header');
  assert.equal(derivePageSection('.hero h1', 'Large Main Headline'), 'hero');
  assert.equal(derivePageSection('form.signup-form button', 'Submit Form Button'), 'cta');
  assert.equal(derivePageSection('img.product-pic', 'Product Image Alt'), 'media');
  assert.equal(derivePageSection('footer .copyright', 'Copyright Notice'), 'footer');
  assert.equal(derivePageSection('article.post p', 'Article Body Paragraph'), 'main');

  const mockIssues = [
    {
      id: '1',
      title: 'Nav issue',
      problem: '',
      whyItMatters: '',
      recommendedFix: '',
      category: 'accessibility',
      priority: 'fix_first' as const,
      evidenceKind: 'measured' as const,
      selector: 'header nav',
      pageSection: 'header' as const,
    },
    {
      id: '2',
      title: 'Hero issue',
      problem: '',
      whyItMatters: '',
      recommendedFix: '',
      category: 'usability' as const,
      priority: 'improve_next' as const,
      evidenceKind: 'suggestion' as const,
      selector: '.hero h1',
      pageSection: 'hero' as const,
    },
    {
      id: '3',
      title: 'CTA issue',
      problem: '',
      whyItMatters: '',
      recommendedFix: '',
      category: 'usability' as const,
      priority: 'optional' as const,
      evidenceKind: 'measured' as const,
      selector: 'button.cta',
      pageSection: 'cta' as const,
    },
  ];

  const groups = groupIssuesBySection(mockIssues);
  assert.equal(groups.length, 3);
  assert.equal(groups[0].section, 'header');
  assert.equal(groups[0].label, 'Header & Navigation');
  assert.equal(groups[0].issues.length, 1);
  assert.equal(groups[1].section, 'hero');
  assert.equal(groups[1].label, 'Hero Section');
  assert.equal(groups[2].section, 'cta');
  assert.equal(groups[2].label, 'Forms & Calls to Action');
});

test('intelligence: generates context-aware AI Fix Prompt for Legacy JavaScript and preserves constraints', () => {
  const prompt = generateFindingFixPrompt({
    title: 'Legacy JavaScript delivered to modern browsers',
    category: 'performance',
    severity: 'medium',
    auditUrl: 'https://example.com',
    problem: 'Modern browsers are receiving legacy polyfills and transpiled code.',
    whyItMatters: 'Unnecessary polyfills inflate the client JavaScript bundle.',
    recommendedFix: 'Update build tooling to target modern browsers (ES2020+).',
    selector: null,
    elementText: null,
    metricEvidence: null,
    originalFinding: {
      id: 'legacy-javascript',
      category: 'performance',
      classification: 'potential_issue',
      severity: 'medium',
      title: 'Legacy JavaScript',
      page_url: 'https://example.com',
      evidence: {},
      why_it_matters: '',
      suggested_change: '',
      implementation_hint: 'Inspect babel and browserslist',
      verification: 'Run production build',
      source: 'lighthouse',
    },
  });

  assert.ok(prompt.includes('AI Fix Prompt'));
  assert.ok(prompt.includes('Investigate the supplied audit evidence to identify the source of unnecessary legacy JavaScript'));
  assert.ok(prompt.includes('Do NOT invent files, components, APIs, or evidence'));
  assert.ok(prompt.includes('None isolated (Page-level, bundle-level, or template defect)'));
  assert.ok(!prompt.includes('Needs plain-language interpretation.'));
});

test('intelligence: guarantees every finding receives non-null agentPrompt without placeholder leakage', () => {
  const mockAudit: AuditResponse = {
    audit_id: 'test-prompt-guarantee',
    url: 'https://mysite.com',
    strategy: 'desktop',
    page_snapshot: {
      url: 'https://mysite.com',
      status_code: 200,
      content_type: 'text/html',
      title: 'Site',
      meta_description: null,
      canonical: null,
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      images: [],
      links: [],
      buttons: [],
      text_excerpt: '',
      html_bytes: 500,
    },
    findings: [
      {
        id: 'lh_render-blocking-resources',
        category: 'performance',
        classification: 'potential_issue',
        severity: 'high',
        title: 'Eliminate render-blocking resources',
        page_url: 'https://mysite.com',
        evidence: {},
        why_it_matters: 'Needs plain-language interpretation.',
        suggested_change: 'Generate an evidence-grounded explanation.',
        implementation_hint: '',
        verification: 'Rerun audit',
        source: 'lighthouse',
      },
    ],
    pagespeed: null,
    summary: { finding_count: 1, by_category: {} },
  };

  const intel = processAuditIntelligence(mockAudit);
  assert.equal(intel.totalIssuesCount, 1);
  const issue = intel.improveNext[0] || intel.fixFirst[0];
  assert.ok(issue);
  assert.ok(issue.agentPrompt);
  assert.ok(!issue.problem.includes('Needs plain-language interpretation.'));
  assert.ok(!issue.whyItMatters.includes('Needs plain-language interpretation.'));
  assert.ok(!issue.recommendedFix.includes('Generate an evidence-grounded explanation.'));
  assert.ok(!issue.agentPrompt.includes('Needs plain-language interpretation.'));
});
