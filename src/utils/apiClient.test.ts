import { test, mock, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

describe('dedupedFetch', () => {
  let nativeFetchMock: any;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    nativeFetchMock = mock.fn(async (input: any, init: any) => {
      // Simulate network delay using setImmediate to avoid relying on mock timers for network mock
      await new Promise(resolve => setImmediate(resolve));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });
    globalThis.fetch = nativeFetchMock as any;
    try { mock.timers.enable({ apis: ['setTimeout'] }); } catch (e) {}
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    mock.reset();
  });

  test('coalesces concurrent GET requests into a single fetch', async () => {
    const { dedupedFetch } = await import('./apiClient.ts?' + Date.now());

    const req1 = dedupedFetch('https://api.example.com/data');
    const req2 = dedupedFetch('https://api.example.com/data');
    const req3 = dedupedFetch('https://api.example.com/data');

    await Promise.all([req1, req2, req3]);

    assert.strictEqual(nativeFetchMock.mock.callCount(), 1);
  });

  test('bypasses cache for POST requests', async () => {
    const { dedupedFetch } = await import('./apiClient.ts?' + Date.now());

    await dedupedFetch('https://api.example.com/data', { method: 'POST' });
    await dedupedFetch('https://api.example.com/data', { method: 'POST' });

    assert.strictEqual(nativeFetchMock.mock.callCount(), 2);
  });

  test('implements stale-while-revalidate and expires cache', async () => {
    const { dedupedFetch } = await import('./apiClient.ts?' + Date.now());

    await dedupedFetch('https://api.example.com/ttl');
    assert.strictEqual(nativeFetchMock.mock.callCount(), 1);

    // Advance time by 4 minutes (still within TTL)
    mock.timers.tick(4 * 60 * 1000);
    await dedupedFetch('https://api.example.com/ttl');
    // Stale-while-revalidate triggers a background fetch
    assert.strictEqual(nativeFetchMock.mock.callCount(), 2);

    // Wait for the background fetch to complete
    await new Promise(resolve => setImmediate(resolve));

    // Advance time by 6 more minutes (total 10 minutes, expires new cache)
    mock.timers.tick(6 * 60 * 1000);
    await dedupedFetch('https://api.example.com/ttl');
    assert.strictEqual(nativeFetchMock.mock.callCount(), 3);
  });

  test('supports AbortSignal isolation', async () => {
    const { dedupedFetch } = await import('./apiClient.ts?' + Date.now());

    const controller1 = new AbortController();
    const controller2 = new AbortController();

    const req1 = dedupedFetch('https://api.example.com/abort', { signal: controller1.signal });
    const req2 = dedupedFetch('https://api.example.com/abort', { signal: controller2.signal });

    controller1.abort();

    await assert.rejects(req1, { name: 'AbortError' });

    const res2 = await req2;
    assert.strictEqual(res2.status, 200);
    assert.strictEqual(nativeFetchMock.mock.callCount(), 1);
  });
});
