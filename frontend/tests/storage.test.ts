import test from 'node:test';
import assert from 'node:assert/strict';
import { browserStorage, STORAGE_VERSION } from '../src/services/storage.ts';
import type { StoredAuditSummary } from '../src/services/storage.ts';
import type { AuditResponse } from '../src/types/api.ts';

// Mock localStorage for Node test environment
const mockStorageData = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => mockStorageData.get(key) || null,
  setItem: (key: string, val: string) => mockStorageData.set(key, val),
  removeItem: (key: string) => mockStorageData.delete(key),
  clear: () => mockStorageData.clear(),
  get length() {
    return mockStorageData.size;
  },
  key: (index: number) => Array.from(mockStorageData.keys())[index] || null,
};

// Polyfill window and localStorage in test context
(globalThis as unknown as Record<string, unknown>).window = {
  localStorage: mockLocalStorage,
  sessionStorage: mockLocalStorage,
};
(globalThis as unknown as Record<string, unknown>).localStorage = mockLocalStorage;
(globalThis as unknown as Record<string, unknown>).sessionStorage = mockLocalStorage;

test('storage: saveAuditSession stores audit session and index summary', () => {
  mockStorageData.clear();

  const audit: AuditResponse = {
    audit_id: 'test_audit_001',
    url: 'https://example.com/',
    strategy: 'mobile',
    page_snapshot: {
      url: 'https://example.com/',
      status_code: 200,
      content_type: 'text/html',
      title: 'Example',
      meta_description: null,
      canonical: null,
      headings: { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] },
      images: [],
      links: [],
      buttons: [],
      text_excerpt: 'Example excerpt',
      html_bytes: 500,
    },
    findings: [
      {
        id: 'f1',
        category: 'seo',
        classification: 'verified_defect',
        severity: 'high',
        title: 'Missing title',
        page_url: 'https://example.com/',
        evidence: {},
        why_it_matters: 'Why',
        suggested_change: 'Fix',
        implementation_hint: 'Hint',
        verification: 'Verify',
        source: 'html_rule',
      },
    ],
    pagespeed: null,
    summary: { finding_count: 1, by_category: { seo: 1 } },
  };

  const success = browserStorage.saveAuditSession(audit);
  assert.strictEqual(success, true);

  const summaries = browserStorage.getRecentAudits();
  assert.strictEqual(summaries.length, 1);
  assert.strictEqual(summaries[0].audit_id, 'test_audit_001');
  assert.strictEqual(summaries[0].verified_defect_count, 1);

  const session = browserStorage.getAuditSession('test_audit_001');
  assert.ok(session);
  assert.strictEqual(session.audit_id, 'test_audit_001');
  assert.strictEqual(session.audit.findings.length, 1);
});

test('storage: deleteAudit removes session and updates summary index', () => {
  assert.strictEqual(browserStorage.getRecentAudits().length, 1);
  browserStorage.deleteAudit('test_audit_001');
  assert.strictEqual(browserStorage.getRecentAudits().length, 0);
  assert.strictEqual(browserStorage.getAuditSession('test_audit_001'), null);
});

test('storage: clearAll purges all saved data and indexes', () => {
  browserStorage.savePromptDraft('test_audit_002', 'Sample prompt draft');
  assert.strictEqual(browserStorage.getPromptDraft('test_audit_002'), 'Sample prompt draft');

  browserStorage.clearAll();
  assert.strictEqual(browserStorage.getPromptDraft('test_audit_002'), '');
  assert.strictEqual(browserStorage.getRecentAudits().length, 0);
});
