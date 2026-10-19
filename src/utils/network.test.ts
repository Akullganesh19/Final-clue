import test from 'node:test';
import assert from 'node:assert';

test('request coalescing', async (t) => {
  const originalFetch = globalThis.fetch;
  let mockFetchCallCount = 0;
  let currentMockFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    mockFetchCallCount++;
    return new Response('ok');
  };

  // Delegator mock for require.cache invalidation
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => currentMockFetch(input, init);

  const { setupRequestCoalescing } = await import('./network.js');
  setupRequestCoalescing();

  await t.test('coalesces multiple GET requests', async () => {
    mockFetchCallCount = 0;
    const p1 = fetch('https://api.example.com/data');
    const p2 = fetch('https://api.example.com/data');

    const [r1, r2] = await Promise.all([p1, p2]);
    assert.strictEqual(mockFetchCallCount, 1);
    assert.strictEqual(await r1.text(), 'ok');
    assert.strictEqual(await r2.text(), 'ok');
  });

  await t.test('bypasses coalescing for POST requests', async () => {
    mockFetchCallCount = 0;
    const p1 = fetch('https://api.example.com/data', { method: 'POST' });
    const p2 = fetch('https://api.example.com/data', { method: 'POST' });

    await Promise.all([p1, p2]);
    assert.strictEqual(mockFetchCallCount, 2);
  });

  await t.test('bypasses coalescing when AbortSignal is present', async () => {
    mockFetchCallCount = 0;
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const p1 = fetch('https://api.example.com/data', { signal: controller1.signal });
    const p2 = fetch('https://api.example.com/data', { signal: controller2.signal });

    await Promise.all([p1, p2]);
    assert.strictEqual(mockFetchCallCount, 2);
  });

  // Restore
  globalThis.fetch = originalFetch;
});
