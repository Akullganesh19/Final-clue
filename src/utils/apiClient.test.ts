import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert';
import { dedupedFetch, clearCache } from './apiClient.ts';

// Mock the global fetch
const originalFetch = global.fetch;

beforeEach(() => {
  clearCache();
  mock.restoreAll();
});

test('dedupedFetch - cache eviction limit', async () => {
  let fetchCallCount = 0;

  const mockFetch = mock.fn(async (url: string | URL | globalThis.Request, options?: RequestInit) => {
    fetchCallCount++;
    return new Response(new ArrayBuffer(8), {
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' })
    });
  });

  global.fetch = mockFetch as any;

  // Make 101 distinct requests
  for (let i = 0; i < 101; i++) {
    await dedupedFetch(`https://api.example.com/data/${i}`);
  }

  assert.strictEqual(fetchCallCount, 101);

  // The first item (i=0) should have been evicted
  const resEvicted = await dedupedFetch('https://api.example.com/data/0');
  assert.strictEqual(fetchCallCount, 102, 'fetch should be called again for evicted item');

  global.fetch = originalFetch;
});

test('dedupedFetch - coalesces concurrent identical requests', async () => {
  let fetchCallCount = 0;

  // Create a deferred promise to control when fetch resolves
  let resolveFetch: (res: Response) => void;
  const fetchPromise = new Promise<Response>((resolve) => {
    resolveFetch = resolve;
  });

  const mockFetch = mock.fn(async (url: string | URL | globalThis.Request, options?: RequestInit) => {
    fetchCallCount++;
    return fetchPromise;
  });

  global.fetch = mockFetch as any;

  const url = 'https://api.example.com/data';

  // Start two concurrent requests
  const req1 = dedupedFetch(url);
  const req2 = dedupedFetch(url);

  // Resolve the fetch
  const mockResponse = new Response(new ArrayBuffer(8), {
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' })
  });
  resolveFetch!(mockResponse);

  const [res1, res2] = await Promise.all([req1, req2]);

  assert.strictEqual(fetchCallCount, 1, 'fetch should only be called once');
  assert.strictEqual(res1.status, 200);
  assert.strictEqual(res2.status, 200);

  global.fetch = originalFetch;
});

test('dedupedFetch - uses cached response', async () => {
  let fetchCallCount = 0;

  const mockFetch = mock.fn(async (url: string | URL | globalThis.Request, options?: RequestInit) => {
    fetchCallCount++;
    return new Response(new ArrayBuffer(8), {
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' })
    });
  });

  global.fetch = mockFetch as any;

  const url = 'https://api.example.com/data';

  // First request
  await dedupedFetch(url);

  // Second request - should use cache
  const res2 = await dedupedFetch(url);

  assert.strictEqual(fetchCallCount, 1, 'fetch should only be called once');
  assert.strictEqual(res2.status, 200);

  global.fetch = originalFetch;
});

test('dedupedFetch - stale-while-revalidate', async () => {
  let fetchCallCount = 0;

  const mockFetch = mock.fn(async (url: string | URL | globalThis.Request, options?: RequestInit) => {
    fetchCallCount++;
    return new Response(new ArrayBuffer(8), {
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' })
    });
  });

  global.fetch = mockFetch as any;

  const url = 'https://api.example.com/data';

  // 1. Initial fetch
  await dedupedFetch(url);
  assert.strictEqual(fetchCallCount, 1);

  // Manipulate the cache to make it stale by mocking Date.now()
  const originalDateNow = Date.now;
  const staleTime = Date.now() + 6 * 60 * 1000; // 6 minutes in the future (default TTL is 5 min)
  Date.now = () => staleTime;

  // 2. Fetch with stale cache
  // It should return the stale data immediately and start a background fetch
  const resStale = await dedupedFetch(url);
  assert.strictEqual(resStale.status, 200);
  assert.strictEqual(fetchCallCount, 2, 'fetch should be called a second time in background');

  // Restore Date.now
  Date.now = originalDateNow;
  global.fetch = originalFetch;
});

test('dedupedFetch - ignores non-GET requests', async () => {
  let fetchCallCount = 0;

  const mockFetch = mock.fn(async (url: string | URL | globalThis.Request, options?: RequestInit) => {
    fetchCallCount++;
    return new Response(new ArrayBuffer(8), {
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' })
    });
  });

  global.fetch = mockFetch as any;

  const url = 'https://api.example.com/data';

  const req1 = dedupedFetch(url, { method: 'POST' });
  const req2 = dedupedFetch(url, { method: 'POST' });

  await Promise.all([req1, req2]);

  assert.strictEqual(fetchCallCount, 2, 'fetch should be called twice for non-GET requests');

  global.fetch = originalFetch;
});
