import test, { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';

describe('Phantom Network Optimizer', () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchCallCount = 0;
  let currentMockFetch: typeof globalThis.fetch;
  let restoreNativeFetch: () => void;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    fetchCallCount = 0;

    // Default simple response
    currentMockFetch = async (input, init) => {
      fetchCallCount++;
      return new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    // The delegator mock
    globalThis.fetch = async (input, init) => {
      return currentMockFetch(input, init);
    };

    // Dynamic import to capture the delegator mock, bust cache to get a fresh module instance
    const buster = Date.now() + Math.random();
    const networkModule = await import(`./network.ts?${buster}`);
    networkModule.setupNetworkOptimizer();
    restoreNativeFetch = networkModule.restoreNativeFetch;

    try {
      mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    } catch (e) {
      // Ignore if already enabled
    }
  });

  afterEach(() => {
    if (restoreNativeFetch) restoreNativeFetch();
    globalThis.fetch = originalFetch;
    mock.timers.reset();
  });

  it('coalesces simultaneous requests to the same URL', async () => {
    // Override the behavior of the captured mock
    currentMockFetch = async () => {
      fetchCallCount++;
      // We need to use process.nextTick or setImmediate to simulate async work
      // without using setTimeout which is mocked
      await new Promise(resolve => process.nextTick(resolve));
      return new Response('{"data": "slow"}', { status: 200 });
    };

    const promise1 = fetch('https://api.example.com/data');
    const promise2 = fetch('https://api.example.com/data');
    const promise3 = fetch('https://api.example.com/data');

    const [res1, res2, res3] = await Promise.all([promise1, promise2, promise3]);

    assert.strictEqual(fetchCallCount, 1);

    const body1 = await res1.json();
    const body2 = await res2.json();
    const body3 = await res3.json();

    assert.deepStrictEqual(body1, { data: 'slow' });
    assert.deepStrictEqual(body2, { data: 'slow' });
    assert.deepStrictEqual(body3, { data: 'slow' });
  });

  it('serves instantly from cache and triggers background revalidation when stale', async () => {
    currentMockFetch = async () => {
      fetchCallCount++;
      // Important: Add async delay so the background fetch doesn't complete synchronously
      await new Promise(resolve => process.nextTick(resolve));
      return new Response('{"data": "test"}', { status: 200 });
    };

    // First request - should hit network
    await fetch('https://api.example.com/stale-test');
    assert.strictEqual(fetchCallCount, 1);

    // Advance time past STALE_TTL_MS (10000) but before EVICTION_TTL_MS (60000)
    mock.timers.tick(15000);

    // Second request - should return instantly from cache (stale), then trigger revalidation
    const res2 = await fetch('https://api.example.com/stale-test');
    assert.strictEqual(res2.status, 200);

    // The background fetch is fire-and-forget, it might have been initiated immediately
    // Wait for the background revalidation to trigger and finish its nextTick
    await new Promise(resolve => process.nextTick(resolve));

    // Now the background fetch should have occurred
    assert.strictEqual(fetchCallCount, 2);
  });

  it('evicts cache entries after EVICTION_TTL_MS', async () => {
    currentMockFetch = async () => {
      fetchCallCount++;
      return new Response('{"data": "test"}', { status: 200 });
    };

    await fetch('https://api.example.com/evict-test');
    assert.strictEqual(fetchCallCount, 1);

    // Advance time past EVICTION_TTL_MS (60000)
    mock.timers.tick(65000);

    // Wait for the setTimeout eviction to process
    await new Promise(resolve => process.nextTick(resolve));

    // Third request - cache was evicted, should hit network immediately
    await fetch('https://api.example.com/evict-test');
    assert.strictEqual(fetchCallCount, 2);
  });

  it('does not cache or coalesce POST requests', async () => {
    const req1 = new Request('https://api.example.com/data', { method: 'POST', body: '1' });
    const req2 = new Request('https://api.example.com/data', { method: 'POST', body: '2' });

    await Promise.all([fetch(req1), fetch(req2)]);

    assert.strictEqual(fetchCallCount, 2);
  });
});
