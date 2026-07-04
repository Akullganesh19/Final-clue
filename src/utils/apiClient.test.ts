import { test } from 'node:test';
import * as assert from 'node:assert';
import { dedupedFetch } from './apiClient';

// Mock global fetch
let fetchCallCount = 0;
const originalFetch = global.fetch;

function setupMockFetch(delayMs: number = 50, responseBody: string = 'ok', status: number = 200) {
  fetchCallCount = 0;
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    fetchCallCount++;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(new Response(responseBody, { status }));
      }, delayMs);
    });
  };
}

function restoreMockFetch() {
  global.fetch = originalFetch;
}

test('dedupedFetch - request coalescing', async () => {
  setupMockFetch(50, 'data');

  const url = 'https://api.example.com/data';

  // Make 3 concurrent requests
  const [res1, res2, res3] = await Promise.all([
    dedupedFetch(url),
    dedupedFetch(url),
    dedupedFetch(url)
  ]);

  const text1 = await res1.text();
  const text2 = await res2.text();
  const text3 = await res3.text();

  assert.strictEqual(fetchCallCount, 1, 'Should only call fetch once for concurrent requests');
  assert.strictEqual(text1, 'data');
  assert.strictEqual(text2, 'data');
  assert.strictEqual(text3, 'data');

  restoreMockFetch();
});

test('dedupedFetch - caching and TTL', async () => {
  setupMockFetch(10, 'cached_data');
  const url = 'https://api.example.com/cache';

  // First request populates cache
  const res1 = await dedupedFetch(url);
  const text1 = await res1.text();
  assert.strictEqual(text1, 'cached_data');
  assert.strictEqual(fetchCallCount, 1);

  // Wait a little bit but under TTL
  await new Promise(resolve => setTimeout(resolve, 20));

  // Second request should use cache
  const res2 = await dedupedFetch(url);
  const text2 = await res2.text();
  assert.strictEqual(text2, 'cached_data');
  assert.strictEqual(fetchCallCount, 1, 'Should use cached response, fetch not called again');

  restoreMockFetch();
});

test('dedupedFetch - max cache size eviction (FIFO)', async () => {
  setupMockFetch(5, 'data');

  // We need to fill the cache (MAX_CACHE_SIZE = 100)
  for (let i = 0; i < 105; i++) {
    await dedupedFetch(`https://api.example.com/item/${i}`);
  }

  assert.strictEqual(fetchCallCount, 105);

  // Now, requests for items 0 to 4 should be evicted and thus cause new fetch calls
  fetchCallCount = 0;
  await dedupedFetch('https://api.example.com/item/0');
  assert.strictEqual(fetchCallCount, 1, 'Evicted item should be fetched again');

  // Requests for items 5 to 104 should still be cached
  fetchCallCount = 0;
  await dedupedFetch('https://api.example.com/item/100');
  assert.strictEqual(fetchCallCount, 0, 'Cached item should not be fetched again');

  restoreMockFetch();
});

test('dedupedFetch - headers in cache key', async () => {
  setupMockFetch(10, 'data');
  const url = 'https://api.example.com/auth';

  await dedupedFetch(url, { headers: { 'Authorization': 'Bearer 1' } });
  assert.strictEqual(fetchCallCount, 1);

  await dedupedFetch(url, { headers: { 'Authorization': 'Bearer 2' } });
  assert.strictEqual(fetchCallCount, 2, 'Different headers should result in different cache keys');

  await dedupedFetch(url, { headers: { 'Authorization': 'Bearer 1' } });
  assert.strictEqual(fetchCallCount, 2, 'Same headers should use cache');

  restoreMockFetch();
});

test('dedupedFetch - bypass cache for non-GET requests', async () => {
  setupMockFetch(10, 'created', 201);
  const url = 'https://api.example.com/resource';

  await dedupedFetch(url, { method: 'POST' });
  assert.strictEqual(fetchCallCount, 1);

  await dedupedFetch(url, { method: 'POST' });
  assert.strictEqual(fetchCallCount, 2, 'POST requests should not be cached');

  restoreMockFetch();
});
