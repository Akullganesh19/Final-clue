import test from 'node:test';
import assert from 'node:assert';
import { dedupedFetch, generateCacheKey, CACHE_TTL_MS, MAX_CACHE_SIZE } from './apiClient';

test('apiClient tests', async (t) => {
  const originalFetch = globalThis.fetch;
  const originalDateNow = Date.now;

  t.beforeEach(() => {
    // Reset cache by mutating the module state? Better way?
    // Since cache isn't exported, we'll reset fetch counts.
  });

  t.afterEach(() => {
    globalThis.fetch = originalFetch;
    Date.now = originalDateNow;
  });

  await t.test('generateCacheKey should properly serialize URLs, methods, and headers', () => {
    const key1 = generateCacheKey('https://api.example.com/data');
    assert.strictEqual(key1, 'GET|https://api.example.com/data|');

    const key2 = generateCacheKey('https://api.example.com/data', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer token', 'Content-Type': 'application/json' }
    });
    assert.strictEqual(key2, 'POST|https://api.example.com/data|authorization:Bearer token\ncontent-type:application/json');

    // Test Headers ordering
    const headers1 = new Headers({ 'b': '2', 'a': '1' });
    const key3 = generateCacheKey('https://api.example.com/data', { headers: headers1 });
    assert.strictEqual(key3, 'GET|https://api.example.com/data|a:1\nb:2');
  });

  await t.test('dedupedFetch should coalesce concurrent requests', async () => {
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls++;
      await new Promise(resolve => setTimeout(resolve, 50));
      return new Response('ok', { status: 200 });
    }) as any;

    const url = 'https://api.example.com/coalesce';

    // Issue 3 concurrent requests
    const promises = [
      dedupedFetch(url),
      dedupedFetch(url),
      dedupedFetch(url)
    ];

    const responses = await Promise.all(promises);

    assert.strictEqual(fetchCalls, 1, 'Should only call fetch once');

    // Each caller should get a separate readable stream (from .clone())
    for (const res of responses) {
      assert.strictEqual(await res.text(), 'ok');
    }
  });

  await t.test('dedupedFetch should not cache or coalesce POST requests', async () => {
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls++;
      await new Promise(resolve => setTimeout(resolve, 10));
      return new Response('ok', { status: 200 });
    }) as any;

    const url = 'https://api.example.com/no-cache';
    const options = { method: 'POST' };

    const promises = [
      dedupedFetch(url, options),
      dedupedFetch(url, options)
    ];

    await Promise.all(promises);

    assert.strictEqual(fetchCalls, 2, 'Should call fetch twice for POST');
  });

  await t.test('dedupedFetch should cache GET requests and expire after TTL', async (t) => {
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls++;
      return new Response('ok', { status: 200 });
    }) as any;

    let mockTime = 10000;
    Date.now = () => mockTime;

    const url = `https://api.example.com/ttl-${Math.random()}`; // unique url to bypass previous cache

    // First request
    await dedupedFetch(url);
    assert.strictEqual(fetchCalls, 1);

    // Second request immediately after (should hit cache)
    await dedupedFetch(url);
    assert.strictEqual(fetchCalls, 1);

    // Advance time past TTL
    mockTime += CACHE_TTL_MS + 1000;

    // Third request (cache expired, should fetch again)
    await dedupedFetch(url);
    assert.strictEqual(fetchCalls, 2);
  });
});
