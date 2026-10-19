import test, { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('Fetch Infrastructure', () => {
  let mockFetchCallCount = 0;
  let currentMockFetch: any;

  beforeEach(() => {
    mockFetchCallCount = 0;
    currentMockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      mockFetchCallCount++;
      return new Response(JSON.stringify({ data: 'mock' }), { status: 200 });
    };

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      return currentMockFetch(input, init);
    };
  });

  afterEach(() => {
    try {
      mock.timers.reset();
    } catch(e) {}
  });

  it('coalesces identical in-flight requests', async () => {
    await import('./fetch.ts');

    let resolveFetch: (res: Response) => void;
    currentMockFetch = async () => {
      mockFetchCallCount++;
      return new Promise(resolve => {
        resolveFetch = resolve;
      });
    };

    const url = 'https://api.example.com/data-' + Math.random();
    const p1 = globalThis.fetch(url);
    const p2 = globalThis.fetch(url);

    resolveFetch!(new Response('ok'));

    await Promise.all([p1, p2]);

    assert.strictEqual(mockFetchCallCount, 1);
  });

  it('caches responses and implements stale-while-revalidate', async () => {
    currentMockFetch = async () => {
      mockFetchCallCount++;
      return new Response('ok');
    };

    const fetchModule = await import('./fetch.ts');
    // Ensure our override isn't wiped by beforeEach!
    globalThis.fetch = fetchModule.coalescedFetch;

    const originalDateNow = Date.now;
    let now = 1000;
    Date.now = () => now;

    const url = 'https://api.example.com/cache-swr-' + Math.random();

    // First request - should hit network
    await globalThis.fetch(url);
    assert.strictEqual(mockFetchCallCount, 1);

    // Second request immediately - should hit cache
    await globalThis.fetch(url);
    assert.strictEqual(mockFetchCallCount, 1);

    // Advance time past TTL (60s)
    now += 61000;

    let resolveBackground: () => void;
    const bgProm = new Promise<void>(res => resolveBackground = res);

    currentMockFetch = async () => {
      mockFetchCallCount++;
      resolveBackground();
      return new Response('ok');
    };

    // Third request - should hit stale cache and trigger background revalidate
    await globalThis.fetch(url);

    await bgProm;

    assert.strictEqual(mockFetchCallCount, 2);

    Date.now = originalDateNow;
  });

  it('respects cache bypass headers', async () => {
    currentMockFetch = async () => {
      mockFetchCallCount++;
      return new Response('ok');
    };

    const fetchModule = await import('./fetch.ts');
    globalThis.fetch = fetchModule.coalescedFetch;

    const url = 'https://api.example.com/bypass-' + Math.random();

    await globalThis.fetch(url, { cache: 'no-cache' });
    await globalThis.fetch(url, { cache: 'no-store' });
    await globalThis.fetch(url, { cache: 'reload' });

    assert.strictEqual(mockFetchCallCount, 3);
  });
});
