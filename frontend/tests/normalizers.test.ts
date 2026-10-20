import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ensureArray,
  ensureString,
  normalizeHeadings,
  normalizeFinding,
  normalizePageSnapshot,
  normalizePageSpeed,
  normalizeAuditResponse,
  normalizeContentPlan,
  normalizeAgentPrompt,
  normalizeChatResponse,
} from '../src/services/normalizers.ts';

test('normalizers: ensureArray handles all undefined and malformed inputs', () => {
  assert.deepEqual(ensureArray(undefined), []);
  assert.deepEqual(ensureArray(null), []);
  assert.deepEqual(ensureArray('string'), []);
  assert.deepEqual(ensureArray(123), []);
  assert.deepEqual(ensureArray({ length: 5 }), []);
  assert.deepEqual(ensureArray([1, 2, 3]), [1, 2, 3]);
});

test('normalizers: normalizeHeadings guarantees all h1-h6 arrays exist', () => {
  const empty = normalizeHeadings(undefined);
  assert.deepEqual(empty.h1, []);
  assert.deepEqual(empty.h2, []);
  assert.deepEqual(empty.h6, []);
  assert.strictEqual(empty.h1.length, 0);

  const partial = normalizeHeadings({ h1: ['Main Title'] });
  assert.strictEqual(partial.h1.length, 1);
  assert.strictEqual(partial.h1[0], 'Main Title');
  assert.deepEqual(partial.h2, []);
});

test('normalizers: normalizeFinding handles missing evidence and examples without length errors', () => {
  const finding = normalizeFinding({
    id: 'test_finding',
    title: 'Missing Alt',
    evidence: { examples: null },
  });

  assert.strictEqual(finding.id, 'test_finding');
  assert.ok(finding.evidence);
  assert.deepEqual(finding.evidence.examples, []);
  assert.strictEqual(finding.evidence.examples.length, 0);
});

test('normalizers: normalizePageSnapshot protects against undefined images/links/buttons', () => {
  const snapshot = normalizePageSnapshot({
    url: 'https://example.com',
    images: null,
    links: undefined,
    buttons: null,
    headings: null,
  });

  assert.strictEqual(snapshot.images.length, 0);
  assert.strictEqual(snapshot.links.length, 0);
  assert.strictEqual(snapshot.buttons.length, 0);
  assert.strictEqual(snapshot.headings.h1.length, 0);
});

test('normalizers: normalizePageSpeed sets missing scores to null, NOT zero', () => {
  const psi = normalizePageSpeed({
    requested_url: 'https://example.com',
    scores: {
      performance: { score: null },
      accessibility: { score: 95 },
      seo: {}, // missing score
    },
    metrics: null,
    audit_findings: null,
  });

  assert.ok(psi);
  assert.strictEqual(psi.scores.performance.score, null);
  assert.strictEqual(psi.scores.accessibility.score, 95);
  assert.strictEqual(psi.scores.seo.score, null);
  assert.notStrictEqual(psi.scores.seo.score, 0);
  assert.deepEqual(psi.audit_findings, []);
  assert.strictEqual(psi.audit_findings.length, 0);
});

test('normalizers: normalizeContentPlan guarantees existing improvements and proposed pages are arrays', () => {
  // Simulates Groq returning incomplete or malformed JSON
  const plan = normalizeContentPlan({
    existing_page_improvements: null,
    proposed_new_pages: undefined,
  });

  assert.deepEqual(plan.existing_page_improvements, []);
  assert.strictEqual(plan.existing_page_improvements.length, 0);
  assert.deepEqual(plan.proposed_new_pages, []);
  assert.strictEqual(plan.proposed_new_pages.length, 0);
});

test('normalizers: normalizeAgentPrompt guarantees changes, acceptance criteria, and assumptions are arrays', () => {
  const prompt = normalizeAgentPrompt({
    title: 'Prompt',
    prompt: 'Do something',
    changes: null,
    acceptance_criteria: undefined,
  });

  assert.strictEqual(prompt.changes.length, 0);
  assert.strictEqual(prompt.acceptance_criteria.length, 0);
  assert.strictEqual(prompt.assumptions.length, 0);
});

test('normalizers: normalizeAuditResponse throws informative error for empty payload and normalizes dirty data', () => {
  assert.throws(() => normalizeAuditResponse(null), /Invalid audit data/);

  const audit = normalizeAuditResponse({
    audit_id: 'test_123',
    url: 'https://example.com',
    findings: null,
    page_snapshot: {},
  });

  assert.strictEqual(audit.findings.length, 0);
  assert.strictEqual(audit.summary.finding_count, 0);
});
