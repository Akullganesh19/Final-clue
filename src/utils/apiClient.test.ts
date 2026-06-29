import { test } from 'node:test';
import * as assert from 'node:assert';
import { dedupedFetch, clearFetchCache } from './apiClient';

// Mock global fetch for testing
let fetchCallCount = 0;
const originalFetch = global.fetch;

test('apiClient tests', async (t) => {
  // Setup before each test logic inside the suite
  t.beforeEach(() => {
    fetchCallCount = 0;
    clearFetchCache();
    global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      fetchCallCount++;
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({ url: url.toString() })
      } as Response;
    };
  });

  t.afterEach(() => {
    global.fetch = originalFetch;
  });

  await t.test('dedupedFetch caches GET requests', async () => {
    const url = 'http://test.com/data';

    const result1 = await dedupedFetch(url);
    const result2 = await dedupedFetch(url);

    assert.deepStrictEqual(result1, { url });
    assert.deepStrictEqual(result2, { url });
    assert.strictEqual(fetchCallCount, 1); // Only fetched once
  });

  await t.test('dedupedFetch does not cache POST requests', async () => {
    const url = 'http://test.com/data';
    const options = { method: 'POST', body: 'test' };

    await dedupedFetch(url, options);
    await dedupedFetch(url, options);

    assert.strictEqual(fetchCallCount, 2); // Fetched twice
  });

  await t.test('dedupedFetch obeys MAX_CACHE_SIZE using FIFO', async () => {
    // Fill the cache (100 items)
    for (let i = 0; i < 100; i++) {
      await dedupedFetch(`http://test.com/data${i}`);
    }

    assert.strictEqual(fetchCallCount, 100);

    // Check item 0 is cached (no fetch)
    await dedupedFetch('http://test.com/data0');
    assert.strictEqual(fetchCallCount, 100);

    // Add 101st item
    await dedupedFetch('http://test.com/data100');
    assert.strictEqual(fetchCallCount, 101);

    // Item 0 should be evicted, fetching again
    await dedupedFetch('http://test.com/data0');
    assert.strictEqual(fetchCallCount, 102);
  });
});
