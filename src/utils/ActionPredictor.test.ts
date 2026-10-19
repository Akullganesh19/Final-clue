import test from 'node:test';
import assert from 'node:assert';
import { actionPredictor } from './ActionPredictor.js';

test('ActionPredictor - should learn sequences and predict next action', () => {
  actionPredictor.reset();

  actionPredictor.observeAction('VIEW_CASE');
  actionPredictor.observeAction('LINK_CASES');
  actionPredictor.observeAction('VIEW_CASE');
  actionPredictor.observeAction('SEARCH_EVIDENCE');
  actionPredictor.observeAction('VIEW_CASE');
  actionPredictor.observeAction('LINK_CASES');

  // VIEW_CASE was followed by LINK_CASES (2 times) and SEARCH_EVIDENCE (1 time)
  // Prediction should favor LINK_CASES
  const prediction = actionPredictor.predictNext('VIEW_CASE');
  assert.strictEqual(prediction, 'LINK_CASES', 'Prediction should be LINK_CASES');
});

test('ActionPredictor - should prefetch likely next action gracefully in mocked environment', async () => {
  actionPredictor.reset();

  let fetchedEndpoint: string | null = null;
  const originalFetch = globalThis.fetch;

  // Mock fetch
  globalThis.fetch = (async (url: string, options: any) => {
    fetchedEndpoint = url;
    return {};
  }) as any;

  // Set window explicitly to bypass SSR checks
  const originalWindow = (globalThis as any).window;
  (globalThis as any).window = {};

  try {
    actionPredictor.observeAction('VIEW_CASE');
    actionPredictor.observeAction('VIEW_AUDIT');
    actionPredictor.observeAction('VIEW_CASE');
    actionPredictor.observeAction('VIEW_AUDIT');

    // Now trigger a prefetch
    actionPredictor.observeAction('VIEW_CASE');

    assert.strictEqual(fetchedEndpoint, '/api/audit', 'Should have prefetched /api/audit');
  } finally {
    globalThis.fetch = originalFetch;
    (globalThis as any).window = originalWindow;
  }
});
