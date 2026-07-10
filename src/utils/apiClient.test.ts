import test, { mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

test('dedupedFetch request coalescing and caching', async (t) => {
  // Store original fetch
  const originalFetch = globalThis.fetch;

  try {
    let callCount = 0;

    // Mock the native fetch before importing apiClient so it captures this mock
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      callCount++;
      return {
        clone: () => ({ status: 200, url, callCount }), // mock clone
        status: 200,
        url
      } as any;
    }) as any;

    // Enable timers
    mock.timers.enable({ apis: ['setTimeout'] });

    // Dynamically import to ensure fresh evaluation
    const { dedupedFetch } = await import(`./apiClient.ts?time=${Date.now()}`);

    await t.test('coalesces simultaneous GET requests', async () => {
      callCount = 0;
      const url = 'https://api.example.com/data';

      const req1 = dedupedFetch(url);
      const req2 = dedupedFetch(url);
      const req3 = dedupedFetch(url);

      const [res1, res2, res3] = await Promise.all([req1, req2, req3]);

      assert.equal(callCount, 1, 'Should only call native fetch once');
      assert.equal((res1 as any).url, url);
      assert.equal((res2 as any).url, url);
      assert.equal((res3 as any).url, url);
    });

    await t.test('does not cache POST requests', async () => {
      callCount = 0;
      const url = 'https://api.example.com/data';

      await dedupedFetch(url, { method: 'POST', body: 'test' });
      await dedupedFetch(url, { method: 'POST', body: 'test' });

      assert.equal(callCount, 2, 'Should call native fetch twice for POST');
    });

    await t.test('respects TTL for cached GET requests', async () => {
      callCount = 0;
      const url = 'https://api.example.com/ttl-test';

      await dedupedFetch(url);
      assert.equal(callCount, 1);

      await dedupedFetch(url);
      assert.equal(callCount, 1, 'Should use cache before TTL expires');

      // Advance time by 5 minutes and 1 millisecond
      mock.timers.tick(5 * 60 * 1000 + 1);

      await dedupedFetch(url);
      assert.equal(callCount, 2, 'Should call native fetch after TTL expires');
    });

  } finally {
    // Restore
    mock.timers.reset();
    globalThis.fetch = originalFetch;
  }
});

test('dedupedFetch request caching behavior with headers and aborts', async (t) => {
  const originalFetch = globalThis.fetch;

  try {
    let callCount = 0;

    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      callCount++;
      // simulate slow network
      await new Promise(r => setTimeout(r, 50));
      return {
        clone: () => ({ status: 200, url, callCount }), // mock clone
        status: 200,
        url
      } as any;
    }) as any;

    const { dedupedFetch } = await import(`./apiClient.ts?time=${Date.now()}`);

    await t.test('caches separately if headers differ', async () => {
      callCount = 0;
      const url = 'https://api.example.com/headers';

      const req1 = dedupedFetch(url, { headers: { 'Authorization': 'Bearer A' } });
      const req2 = dedupedFetch(url, { headers: { 'Authorization': 'Bearer B' } });
      const req3 = dedupedFetch(url, { headers: { 'Authorization': 'Bearer A' } });

      await Promise.all([req1, req2, req3]);
      assert.equal(callCount, 2, 'Should call twice due to different headers');
    });

    await t.test('bypasses cache when init.cache demands it', async () => {
      callCount = 0;
      const url = 'https://api.example.com/no-cache';

      await dedupedFetch(url);
      await dedupedFetch(url, { cache: 'no-store' });
      await dedupedFetch(url, { cache: 'reload' });
      await dedupedFetch(url); // Should hit cache from first request

      assert.equal(callCount, 3);
    });

    await t.test('aborting one coalesced request does not abort others', async () => {
      callCount = 0;
      const url = 'https://api.example.com/abort';

      const controller1 = new AbortController();
      const controller2 = new AbortController();

      const req1 = dedupedFetch(url, { signal: controller1.signal });
      const req2 = dedupedFetch(url, { signal: controller2.signal });

      controller1.abort(); // abort only first request

      let req1Err;
      try {
        await req1;
      } catch (e) {
        req1Err = e;
      }

      const res2 = await req2; // Should succeed

      assert.ok(req1Err, 'First request should throw abort error');
      assert.equal((req1Err as any).name, 'AbortError');
      assert.equal((res2 as any).url, url, 'Second request should succeed');
      assert.equal(callCount, 1, 'Should have only initiated network request once');
    });

  } finally {
    globalThis.fetch = originalFetch;
  }
});
