import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { dedupedFetch, cachedFetch, clearApiCache } from './apiClient.js';

describe('apiClient', () => {
  let originalFetch: typeof global.fetch;
  let fetchCallCount = 0;

  beforeEach(() => {
    // Mock global fetch
    originalFetch = global.fetch;
    fetchCallCount = 0;

    global.fetch = async (url: string | URL | globalThis.Request, options?: RequestInit) => {
      fetchCallCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({ mockData: true, url: url.toString() }),
      } as Response;
    };

    clearApiCache();
  });

  afterEach(() => {
    // Restore global fetch
    global.fetch = originalFetch;
  });

  test('dedupedFetch request coalescing', async () => {
    // Trigger 5 concurrent requests to the same URL
    const url = '/api/mock-endpoint';

    const promises = [
      dedupedFetch(url),
      dedupedFetch(url),
      dedupedFetch(url),
      dedupedFetch(url),
      dedupedFetch(url)
    ];

    const results = await Promise.all(promises);

    // All requests should return the exact same parsed data
    for (const result of results) {
      assert.deepStrictEqual(result, { mockData: true, url });
    }

    // Crucially, the actual network fetch should only have been called ONCE
    assert.strictEqual(fetchCallCount, 1, 'Fetch should only be called once due to request coalescing');
  });

  test('cachedFetch stale-while-revalidate', async () => {
    const url = '/api/swr-endpoint';

    // First call, cache miss, should fetch network
    const result1 = await cachedFetch(url);
    assert.deepStrictEqual(result1, { mockData: true, url });
    assert.strictEqual(fetchCallCount, 1, 'First fetch should hit network');

    // Modify mock to prove we get stale data initially
    const firstFetchRef = global.fetch;
    global.fetch = async (reqUrl: string | URL | globalThis.Request, options?: RequestInit) => {
      fetchCallCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({ mockData: 'updated', url: reqUrl.toString() }),
      } as Response;
    };

    // Second call, cache hit, should return immediately (stale data) while revalidating
    let revalidatedData: any = null;
    const result2 = await cachedFetch(url, 60000, (data) => {
      revalidatedData = data;
    });

    // Should return original stale data
    assert.deepStrictEqual(result2, { mockData: true, url });

    // Wait a tick for background fetch promise to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    // The background fetch should have occurred
    assert.strictEqual(fetchCallCount, 2, 'Background fetch should have happened');

    // Revalidation callback should have the new data
    assert.deepStrictEqual(revalidatedData, { mockData: 'updated', url });

    // Third call, cache hit, should return the newly revalidated data
    const result3 = await cachedFetch(url);
    assert.deepStrictEqual(result3, { mockData: 'updated', url });
  });
});
