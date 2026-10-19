import test from 'node:test';
import assert from 'node:assert';
import { dedupedFetch, clearCache } from './apiClient.ts';

test('dedupedFetch request coalescing', async () => {
  clearCache();

  let fetchCount = 0;
  global.fetch = async () => {
    fetchCount++;
    return {
      ok: true,
      json: async () => ({ status: 'ok' })
    } as any;
  };

  const p1 = dedupedFetch('/api/test');
  const p2 = dedupedFetch('/api/test');

  await Promise.all([p1, p2]);

  assert.strictEqual(fetchCount, 1, 'Multiple requests should be coalesced into a single fetch');
});

test('dedupedFetch caching and stale-while-revalidate', async (t) => {
  clearCache();

  let fetchCount = 0;
  let responseData = { version: 1 };

  global.fetch = async () => {
    fetchCount++;
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      ok: true,
      json: async () => responseData
    } as any;
  };

  // First request - should fetch and cache
  const result1 = await dedupedFetch('/api/test-cache');
  assert.strictEqual(result1.version, 1);
  assert.strictEqual(fetchCount, 1);

  // Update data that the server will return
  responseData = { version: 2 };

  // Second request - should return cached value immediately
  const result2 = await dedupedFetch('/api/test-cache');
  assert.strictEqual(result2.version, 1, 'Should return cached data immediately');
  assert.strictEqual(fetchCount, 1, 'Should not have finished fetching new data yet');

  // Mock Date.now to simulate TTL expiry (5 mins + 1 ms)
  const realDateNow = Date.now;
  global.Date.now = () => realDateNow() + (5 * 60 * 1000) + 1;

  // Third request - TTL expired, should return stale data but trigger background refresh
  const result3 = await dedupedFetch('/api/test-cache');
  assert.strictEqual(result3.version, 1, 'Should return stale data immediately');

  // Wait for background refresh to complete
  await new Promise(resolve => setTimeout(resolve, 100));

  // Fourth request - should now return updated data
  const result4 = await dedupedFetch('/api/test-cache');
  assert.strictEqual(result4.version, 2, 'Should return newly cached data after background refresh');

  // Restore Date.now
  global.Date.now = realDateNow;
});
