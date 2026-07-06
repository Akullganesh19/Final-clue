import test, { mock } from 'node:test';
import assert from 'node:assert';
import { dedupedFetch, clearCache } from './apiClient';

test('dedupedFetch', async (t) => {
  t.beforeEach(() => {
    clearCache();
    mock.restoreAll();
  });

  await t.test('coalesces concurrent identical GET requests', async () => {
    let fetchCalls = 0;
    mock.method(globalThis, 'fetch', async () => {
      fetchCalls++;
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
      return new Response('ok', { status: 200 });
    });

    const [res1, res2, res3] = await Promise.all([
      dedupedFetch('https://api.example.com/data'),
      dedupedFetch('https://api.example.com/data'),
      dedupedFetch('https://api.example.com/data'),
    ]);

    assert.strictEqual(fetchCalls, 1);
    assert.strictEqual(await res1.text(), 'ok');
    assert.strictEqual(await res2.text(), 'ok');
    assert.strictEqual(await res3.text(), 'ok');
  });

  await t.test('bypasses cache and coalescing for POST requests', async () => {
    let fetchCalls = 0;
    mock.method(globalThis, 'fetch', async () => {
      fetchCalls++;
      return new Response('ok', { status: 200 });
    });

    const [res1, res2] = await Promise.all([
      dedupedFetch('https://api.example.com/data', { method: 'POST' }),
      dedupedFetch('https://api.example.com/data', { method: 'POST' }),
    ]);

    assert.strictEqual(fetchCalls, 2);
  });

  await t.test('serves from cache for subsequent identical requests', async () => {
    let fetchCalls = 0;
    mock.method(globalThis, 'fetch', async () => {
      fetchCalls++;
      return new Response('ok', { status: 200 });
    });

    await dedupedFetch('https://api.example.com/data');
    assert.strictEqual(fetchCalls, 1);

    await dedupedFetch('https://api.example.com/data');
    assert.strictEqual(fetchCalls, 1);
  });

  await t.test('expires cache after TTL', async () => {
    let fetchCalls = 0;
    mock.method(globalThis, 'fetch', async () => {
      fetchCalls++;
      return new Response('ok', { status: 200 });
    });

    // We must mock both the Date.now and enable mock.timers for proper time travel
    let currentTime = 1000000;
    mock.method(globalThis.Date, 'now', () => currentTime);
    mock.timers.enable({ apis: ['setTimeout', 'Date'] });

    await dedupedFetch('https://api.example.com/data');
    assert.strictEqual(fetchCalls, 1);

    // Advance time by 6 minutes (TTL is 5 minutes)
    currentTime += 6 * 60 * 1000;
    mock.timers.tick(6 * 60 * 1000);

    await dedupedFetch('https://api.example.com/data');
    assert.strictEqual(fetchCalls, 2);
  });

  await t.test('different headers bypass cache', async () => {
    let fetchCalls = 0;
    mock.method(globalThis, 'fetch', async () => {
      fetchCalls++;
      return new Response('ok', { status: 200 });
    });

    await dedupedFetch('https://api.example.com/data', { headers: { 'Authorization': 'Bearer A' } });
    assert.strictEqual(fetchCalls, 1);

    await dedupedFetch('https://api.example.com/data', { headers: { 'Authorization': 'Bearer B' } });
    assert.strictEqual(fetchCalls, 2);
  });
});
