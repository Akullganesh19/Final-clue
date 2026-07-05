import { test, mock, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { dedupedFetch, clearCache, MAX_CACHE_SIZE, CACHE_TTL_MS } from './apiClient';

// Helper to create a fake response
const createFakeResponse = (body: string, status = 200, ok = true) => {
  return {
    ok,
    status,
    text: async () => body,
    json: async () => JSON.parse(body),
    clone: function() { return { ...this }; }
  } as unknown as Response;
};

test('apiClient tests', async (t) => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    clearCache();
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mock.timers.reset();
  });

  await t.test('dedupedFetch request coalescing', async () => {
    let fetchCount = 0;

    // Mock global fetch to return a delayed response to allow coalescing
    globalThis.fetch = async (url) => {
      fetchCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
      return createFakeResponse(`{"data": "mocked", "url": "${url}"}`);
    };

    // Fire 3 simultaneous requests to the same URL
    const url = 'https://api.example.com/data';
    const [res1, res2, res3] = await Promise.all([
      dedupedFetch(url),
      dedupedFetch(url),
      dedupedFetch(url)
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();
    const data3 = await res3.json();

    assert.strictEqual(fetchCount, 1, 'Should only call fetch once for simultaneous identical requests');
    assert.deepStrictEqual(data1, data2);
    assert.deepStrictEqual(data2, data3);
  });

  await t.test('dedupedFetch caching functionality', async () => {
    let fetchCount = 0;

    globalThis.fetch = async (url) => {
      fetchCount++;
      return createFakeResponse(`{"data": "cached", "count": ${fetchCount}}`);
    };

    const url = 'https://api.example.com/cached-data';

    // First request
    const res1 = await dedupedFetch(url);
    const data1 = await res1.json();
    assert.strictEqual(fetchCount, 1);
    assert.strictEqual(data1.count, 1);

    // Second request (should hit cache)
    const res2 = await dedupedFetch(url);
    const data2 = await res2.json();
    assert.strictEqual(fetchCount, 1, 'Should return from cache without calling fetch');
    assert.strictEqual(data2.count, 1);
  });

  await t.test('dedupedFetch TTL expiration', async () => {
    // We mock globalThis.Date.now manually for this test since apiClient uses it
    const originalDateNow = Date.now;
    let mockedTime = 1000;
    globalThis.Date.now = () => mockedTime;

    let fetchCount = 0;

    globalThis.fetch = async (url) => {
      fetchCount++;
      return createFakeResponse(`{"data": "ttl", "count": ${fetchCount}}`);
    };

    const url = 'https://api.example.com/ttl-data';

    await dedupedFetch(url);
    assert.strictEqual(fetchCount, 1);

    // Advance time just past TTL
    mockedTime += CACHE_TTL_MS + 100;

    // Next request should hit network again
    await dedupedFetch(url);
    assert.strictEqual(fetchCount, 2, 'Should hit network after TTL expires');

    globalThis.Date.now = originalDateNow;
  });

  await t.test('dedupedFetch eviction (MAX_CACHE_SIZE)', async () => {
    let fetchCount = 0;

    globalThis.fetch = async (url) => {
      fetchCount++;
      return createFakeResponse(`{"url": "${url}"}`);
    };

    // Fill cache up to max size + 10 (so first 10 should be evicted)
    const extraItems = 10;
    for (let i = 0; i < MAX_CACHE_SIZE + extraItems; i++) {
      await dedupedFetch(`https://api.example.com/item-${i}`);
    }

    // Reset fetchCount to measure cache hits/misses
    fetchCount = 0;

    // First item should have been evicted (cache miss)
    await dedupedFetch(`https://api.example.com/item-0`);
    assert.strictEqual(fetchCount, 1, 'First item should have been evicted');

    // Last item should still be in cache
    await dedupedFetch(`https://api.example.com/item-${MAX_CACHE_SIZE + extraItems - 1}`);
    assert.strictEqual(fetchCount, 1, 'Last item should still be in cache');
  });

  await t.test('dedupedFetch bypasses cache for non-GET/HEAD requests', async () => {
    let fetchCount = 0;

    globalThis.fetch = async (url, init) => {
      fetchCount++;
      await new Promise(resolve => setTimeout(resolve, 50)); // Allow time for coalescing if it was incorrectly applied
      return createFakeResponse(`{"method": "${init?.method}", "count": ${fetchCount}}`);
    };

    const url = 'https://api.example.com/post-data';

    // First POST request
    const res1 = await dedupedFetch(url, { method: 'POST', body: 'test1' });

    // Second POST request
    const res2 = await dedupedFetch(url, { method: 'POST', body: 'test2' });

    const data1 = await res1.json();
    const data2 = await res2.json();

    assert.strictEqual(fetchCount, 2, 'Should not coalesce POST requests');
    assert.strictEqual(data1.count, 1);
    assert.strictEqual(data2.count, 2);

    // Third POST request sequentially (should not hit cache)
    const res3 = await dedupedFetch(url, { method: 'POST', body: 'test3' });
    const data3 = await res3.json();

    assert.strictEqual(fetchCount, 3, 'Should not cache POST requests');
    assert.strictEqual(data3.count, 3);
  });
});
