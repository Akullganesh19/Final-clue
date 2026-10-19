import { test } from 'node:test';
import * as assert from 'node:assert';
import {
  dedupedFetch,
  clearCache,
  generateCacheKey,
  MAX_CACHE_SIZE,
  CACHE_TTL_MS
} from './apiClient';

// Mock global fetch
const originalFetch = globalThis.fetch;
let fetchCallCount = 0;

function setupMockFetch() {
  fetchCallCount = 0;
  globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
    fetchCallCount++;
    return new Response(JSON.stringify({ mockData: 'test' }), {
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' })
    });
  };
}

function restoreFetch() {
  globalThis.fetch = originalFetch;
}

test('apiClient tests', async (t) => {
  t.beforeEach(() => {
    setupMockFetch();
    clearCache();
  });

  t.after(() => {
    restoreFetch();
    clearCache();
  });

  await t.test('generateCacheKey normalizes headers correctly', () => {
    const key1 = generateCacheKey('http://api.test', {
      headers: { 'X-B': '2', 'X-A': '1' }
    });
    const key2 = generateCacheKey('http://api.test', {
      headers: { 'X-A': '1', 'X-B': '2' }
    });

    // Headers should be sorted so keys match
    assert.strictEqual(key1, key2);
    assert.match(key1, /http:\/\/api.test::/);
    assert.match(key1, /x-a:1/);
    assert.match(key1, /x-b:2/);
  });

  await t.test('dedupedFetch coalesces concurrent requests to the same URL', async () => {
    // Delay fetch mock so we can queue up requests
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      fetchCallCount++;
      await new Promise(r => setTimeout(r, 50));
      return new Response('ok', { status: 200 });
    };

    const url = 'http://test.local/data';
    const p1 = dedupedFetch(url);
    const p2 = dedupedFetch(url);
    const p3 = dedupedFetch(url);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    assert.strictEqual(fetchCallCount, 1, 'Fetch should only be called once for concurrent requests');
    assert.strictEqual(await r1.text(), 'ok');
    assert.strictEqual(await r2.text(), 'ok');
    assert.strictEqual(await r3.text(), 'ok');
  });

  await t.test('dedupedFetch caches sequential GET requests', async () => {
    const url = 'http://test.local/sequential';

    const r1 = await dedupedFetch(url);
    assert.strictEqual(fetchCallCount, 1);

    const r2 = await dedupedFetch(url);
    assert.strictEqual(fetchCallCount, 1, 'Second fetch should be cached');

    assert.strictEqual(await r1.json().then(j => j.mockData), 'test');
    assert.strictEqual(await r2.json().then(j => j.mockData), 'test');
  });

  await t.test('dedupedFetch does not cache non-GET requests', async () => {
    const url = 'http://test.local/post';

    await dedupedFetch(url, { method: 'POST' });
    assert.strictEqual(fetchCallCount, 1);

    await dedupedFetch(url, { method: 'POST' });
    assert.strictEqual(fetchCallCount, 2, 'POST requests should not be cached');
  });

  await t.test('dedupedFetch enforces MAX_CACHE_SIZE using FIFO', async () => {
    // Fill the cache up to MAX_CACHE_SIZE + 5
    for (let i = 0; i < MAX_CACHE_SIZE + 5; i++) {
      await dedupedFetch(`http://test.local/item/${i}`);
    }

    assert.strictEqual(fetchCallCount, MAX_CACHE_SIZE + 5);

    // The first 5 items should have been evicted
    const r1 = await dedupedFetch(`http://test.local/item/0`);
    assert.strictEqual(fetchCallCount, MAX_CACHE_SIZE + 6, 'Evicted item should be re-fetched');

    // The last item added should still be cached
    const r2 = await dedupedFetch(`http://test.local/item/${MAX_CACHE_SIZE + 4}`);
    assert.strictEqual(fetchCallCount, MAX_CACHE_SIZE + 6, 'Recent item should still be cached');
  });

  await t.test('dedupedFetch converts relative URLs to absolute in SSR (simulated)', async () => {
    const originalWindow = globalThis.window;
    // Simulate SSR by making window undefined temporarily (if it exists)
    // Note: Node environment doesn't have window by default.
    // We just verify it handles relative URLs

    let fetchedUrl = '';
    globalThis.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      fetchCallCount++;
      fetchedUrl = url.toString();
      return new Response('ok', { status: 200 });
    };

    const relativeUrl = '/api/data';
    await dedupedFetch(relativeUrl);

    assert.strictEqual(fetchCallCount, 1);
    assert.ok(fetchedUrl.startsWith('http'), `URL should be absolute, got: ${fetchedUrl}`);
    assert.match(fetchedUrl, /http:\/\/localhost:3000\/api\/data/);
  });
});
