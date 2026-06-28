import test from 'node:test';
import assert from 'node:assert/strict';
import { dedupedFetch, clearApiCache } from './apiClient';

test('dedupedFetch - request coalescing', async (t) => {
  // Clear any state
  clearApiCache();

  let fetchCallCount = 0;

  // Mock global fetch
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    fetchCallCount++;
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    const url = 'https://api.example.com/data';

    // Make 3 concurrent identical requests
    const p1 = dedupedFetch(url);
    const p2 = dedupedFetch(url);
    const p3 = dedupedFetch(url);

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    // All should get success response
    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200);
    assert.equal(r3.status, 200);

    // But fetch should only have been called ONCE due to coalescing
    assert.equal(fetchCallCount, 1);
  } finally {
    // Restore fetch
    global.fetch = originalFetch;
  }
});

test('dedupedFetch - cache hits', async (t) => {
  clearApiCache();

  let fetchCallCount = 0;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    fetchCallCount++;
    return new Response(JSON.stringify({ fetchNum: fetchCallCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  try {
    const url = 'https://api.example.com/cached';

    // First request - should hit network
    const r1 = await dedupedFetch(url);
    const data1 = await r1.json();
    assert.equal(data1.fetchNum, 1);
    assert.equal(fetchCallCount, 1);

    // Second request immediately after - should hit cache
    const r2 = await dedupedFetch(url);
    const data2 = await r2.json();
    assert.equal(data2.fetchNum, 1); // Returns first response
    assert.equal(fetchCallCount, 1); // fetch not called again

  } finally {
    global.fetch = originalFetch;
  }
});
