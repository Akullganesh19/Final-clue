import test from 'node:test';
import assert from 'node:assert';
import { dedupedFetch, clearCache } from './src/utils/apiClient.js';

test('dedupedFetch coalesces concurrent requests', async (t) => {
  clearCache();
  let fetchCallCount = 0;

  // Mock global fetch
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    fetchCallCount++;
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const url = 'http://example.com/api/test';

    // Initiate two concurrent requests
    const promise1 = dedupedFetch(url);
    const promise2 = dedupedFetch(url);

    const [res1, res2] = await Promise.all([promise1, promise2]);

    assert.deepStrictEqual(res1, { status: 'ok' });
    assert.deepStrictEqual(res2, { status: 'ok' });
    assert.strictEqual(fetchCallCount, 1, 'Fetch should only be called once for concurrent requests');
  } finally {
    global.fetch = originalFetch;
    clearCache();
  }
});
