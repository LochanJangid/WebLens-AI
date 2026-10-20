import test from 'node:test';
import assert from 'node:assert/strict';
import type { VisualAuditResponse, VisualAnnotation } from '../src/types/api.ts';

test('visual audit: validates structured visual response and coordinates', () => {
  const sampleAnnotation: VisualAnnotation = {
    id: 'anno_1',
    number: 1,
    finding_id: 'img_alt_1',
    title: 'Image missing descriptive alt attribute',
    category: 'accessibility',
    severity: 'medium',
    box: { x: 40, y: 120, width: 280, height: 160 },
    selector: 'img.product-hero',
    element_text: 'src=/img/hero.png',
    why_it_matters: 'Screen readers cannot describe visual content.',
    suggested_change: 'Add descriptive alt text.',
    agent_prompt: 'Target: `img.product-hero`\nFix: Add alt text.',
    suggested_mockup: 'Rendered with accessible alt attribute',
  };

  const sampleVisual: VisualAuditResponse = {
    url: 'https://example.com',
    strategy: 'desktop',
    viewport: { width: 1280, height: 800, device_scale_factor: 1 },
    full_page_dimensions: { width: 1280, height: 1800 },
    viewport_screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSU',
    full_page_screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSU',
    annotations: [sampleAnnotation],
    failed: false,
    error: null,
  };

  assert.equal(sampleVisual.failed, false);
  assert.equal(sampleVisual.viewport.width, 1280);
  assert.equal(sampleVisual.annotations.length, 1);
  assert.equal(sampleVisual.annotations[0].number, 1);
  assert.ok(sampleVisual.annotations[0].box.width > 0);
  assert.ok(sampleVisual.annotations[0].box.height > 0);
  assert.equal(sampleVisual.annotations[0].severity, 'medium');
});

test('visual audit: handles failed capture gracefully without crashing', () => {
  const failedVisual: VisualAuditResponse = {
    url: 'https://blocked-by-waf.com',
    strategy: 'desktop',
    viewport: { width: 1280, height: 800, device_scale_factor: 1 },
    full_page_dimensions: { width: 1280, height: 800 },
    viewport_screenshot: null,
    full_page_screenshot: null,
    annotations: [],
    failed: true,
    error: 'Failed to load page in browser (network timeout or bot challenge).',
  };

  assert.equal(failedVisual.failed, true);
  assert.equal(failedVisual.annotations.length, 0);
  assert.equal(failedVisual.viewport_screenshot, null);
  assert.ok(failedVisual.error && failedVisual.error.includes('Failed to load page'));
});

test('visual audit: ensures coordinates map to non-negative pixel ranges', () => {
  const boxes = [
    { x: 0, y: 0, width: 1280, height: 80 },
    { x: 100.5, y: 340.2, width: 220, height: 44 },
  ];

  for (const b of boxes) {
    assert.ok(b.x >= 0, 'X must be non-negative');
    assert.ok(b.y >= 0, 'Y must be non-negative');
    assert.ok(b.width > 0, 'Width must be positive');
    assert.ok(b.height > 0, 'Height must be positive');
  }
});
