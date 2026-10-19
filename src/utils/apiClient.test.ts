import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { resilientFetch, dedupedFetch } from './apiClient';

describe('apiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset fetch before each test
    global.fetch = originalFetch;
  });

  test('resilientFetch should use fallback on 500 error', async () => {
    global.fetch = async () => new Response(null, { status: 500 });
    let fallbackCalled = false;

    const response = await resilientFetch('http://test', {
      maxAttempts: 1,
      fallbackFn: () => {
        fallbackCalled = true;
        return { data: 'fallback' };
      }
    });

    assert.strictEqual(fallbackCalled, true);
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.deepStrictEqual(data, { data: 'fallback' });
  });
});
