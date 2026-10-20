import test from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/services/api.ts';

test('screenshot AI: generates structured design critique and aesthetic grade', async () => {
  const result = await api.analyzeScreenshot({
    screenshot_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    website_url: 'https://example.com',
    brand_name: 'Acme Corp',
    strategy: 'desktop',
  });

  assert.equal(result.brand_name, 'Acme Corp');
  assert.equal(result.strategy, 'desktop');
  assert.ok(result.design_critique.visual_hierarchy_score > 0);
  assert.ok(typeof result.design_critique.aesthetic_grade === 'string');
  assert.ok(result.design_critique.color_palette.recommended_palette.length >= 3);
  assert.ok(result.design_critique.conversion_rate_optimization.length >= 2);
  assert.ok(result.design_critique.accessibility_notes.length >= 2);
});

test('screenshot AI: provides tailored multimodal prompts for Claude, GPT-4o, Cursor, and v0', async () => {
  const result = await api.analyzeScreenshot({
    screenshot_base64: 'data:image/png;base64,dummy',
    brand_name: 'SuperSite',
  });

  assert.ok(result.tailored_prompts.claude_vision.includes('ATTACH THE DOWNLOADED SCREENSHOT'));
  assert.ok(result.tailored_prompts.gpt4o_vision.includes('SuperSite'));
  assert.ok(result.tailored_prompts.cursor_composer.includes('Refactor and visually elevate'));
  assert.ok(result.tailored_prompts.v0_generative.includes('Next.js'));
});

test('screenshot AI: includes valid production-ready React + Tailwind starter code', async () => {
  const result = await api.analyzeScreenshot({
    screenshot_base64: 'data:image/png;base64,dummy',
    brand_name: 'RocketApp',
  });

  assert.ok(result.suggested_react_tailwind_code.includes('export default function'));
  assert.ok(result.suggested_react_tailwind_code.includes('Tailwind') || result.suggested_react_tailwind_code.includes('className='));
  assert.ok(result.suggested_react_tailwind_code.includes('RocketApp'));
});
