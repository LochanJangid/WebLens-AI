import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLightweightExplanation,
  filterFindingsForLlm,
  getExplanationCacheKey,
} from '../src/services/preprocessor.ts';
import type { Finding } from '../src/types/api.ts';

test('preprocessor: Level 1 deterministic templates provide zero-token explanations for common issues', () => {
  const missingTitleFinding: Finding = {
    id: 'seo_missing_title',
    title: 'This page has no title',
    category: 'seo',
    classification: 'verified_defect',
    severity: 'high',
    page_url: 'https://example.com',
    evidence: { selector: 'head > title' },
    why_it_matters: 'Title is crucial for SEO and tabs',
    suggested_change: 'Add title',
    implementation_hint: 'Add <title>',
    verification: 'Reload browser',
    source: 'html_rule',
  };

  const explanation = getLightweightExplanation(missingTitleFinding);
  assert.ok(explanation);
  assert.strictEqual(explanation.category, 'seo');
  assert.strictEqual(explanation.confidence, 'high');
  assert.ok(explanation.steps && explanation.steps.length > 0);
  assert.ok(explanation.example);
  assert.strictEqual(explanation.selector, 'head > title');
});

test('preprocessor: Level 1 handles missing_alt with actual count evidence', () => {
  const missingAltFinding: Finding = {
    id: 'accessibility_missing_alt',
    title: 'Images without alt text',
    category: 'accessibility',
    classification: 'verified_defect',
    severity: 'medium',
    page_url: 'https://example.com',
    evidence: { count: 4, selector: 'img:not([alt])' },
    why_it_matters: 'Screen readers need alt',
    suggested_change: 'Add alt',
    implementation_hint: 'Add alt attribute',
    verification: 'Inspect img',
    source: 'html_rule',
  };

  const explanation = getLightweightExplanation(missingAltFinding);
  assert.ok(explanation);
  assert.ok(explanation.explanation?.includes('4 images lack'));
});

test('preprocessor: filterFindingsForLlm deduplicates identical findings and truncates long text', () => {
  const findings: Finding[] = [
    {
      id: 'f1',
      title: 'Missing meta description',
      category: 'seo',
      classification: 'verified_defect',
      severity: 'medium',
      page_url: 'https://example.com',
      evidence: { selector: 'head meta', text: 'A'.repeat(1000) },
      why_it_matters: 'B'.repeat(1000),
      suggested_change: 'C'.repeat(1000),
      implementation_hint: 'D'.repeat(1000),
      verification: 'E'.repeat(1000),
      source: 'html_rule',
    },
    // Duplicate of f1 with same title and selector
    {
      id: 'f2',
      title: 'Missing meta description',
      category: 'seo',
      classification: 'verified_defect',
      severity: 'medium',
      page_url: 'https://example.com',
      evidence: { selector: 'head meta' },
      why_it_matters: 'Duplicate',
      suggested_change: 'Duplicate',
      implementation_hint: 'Duplicate',
      verification: 'Duplicate',
      source: 'html_rule',
    },
  ];

  const filtered = filterFindingsForLlm(findings);
  // Deduplication must drop the duplicate finding
  assert.strictEqual(filtered.length, 1);

  // Truncation check
  const item = filtered[0];
  assert.ok(String(item.why_it_matters).length <= 250);
  assert.ok(String((item.evidence as Record<string, unknown>).text).length <= 300);
});

test('preprocessor: getExplanationCacheKey produces deterministic cache keys', () => {
  const f1: Finding = {
    id: 'seo_h1',
    title: 'Missing H1',
    category: 'content',
    classification: 'verified_defect',
    severity: 'medium',
    page_url: 'https://example.com',
    evidence: { selector: 'h1' },
    why_it_matters: 'Why',
    suggested_change: 'Change',
    implementation_hint: 'Hint',
    verification: 'Verify',
    source: 'html_rule',
  };

  const key1 = getExplanationCacheKey(f1);
  const key2 = getExplanationCacheKey(f1);
  assert.strictEqual(key1, key2);
  assert.ok(key1.startsWith('weblens_exp_v2_'));
});
