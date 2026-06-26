import test from 'node:test';
import assert from 'node:assert';
import { dedupedFetch, staleWhileRevalidateFetch, clearCache } from './apiClient.js';

test('dedupedFetch coalesces concurrent requests', async () => {
  let fetchCallCount = 0;

  const originalFetch = global.fetch;
  global.fetch = async (url: string | URL | Request, options?: RequestInit) => {
    fetchCallCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
    return new Response(JSON.stringify({ data: 'ok' }), { status: 200 });
  };

  try {
    const url = 'https://api.example.com/data';

    const [res1, res2, res3] = await Promise.all([
      dedupedFetch(url),
      dedupedFetch(url),
      dedupedFetch(url)
    ]);

    const json1 = await res1.json();
    const json2 = await res2.json();
    const json3 = await res3.json();

    assert.strictEqual(fetchCallCount, 1);
    assert.deepStrictEqual(json1, { data: 'ok' });
    assert.deepStrictEqual(json2, { data: 'ok' });
    assert.deepStrictEqual(json3, { data: 'ok' });
  } finally {
    global.fetch = originalFetch;
    clearCache();
  }
});

test('staleWhileRevalidateFetch serves from cache and fetches in background', async () => {
  let fetchCallCount = 0;

  const originalFetch = global.fetch;
  global.fetch = async (url: string | URL | Request, options?: RequestInit) => {
    fetchCallCount++;
    return new Response(JSON.stringify({ version: fetchCallCount }), { status: 200 });
  };

  const realDateNow = Date.now;

  try {
    const url = 'https://api.example.com/stale';

    const res1 = await staleWhileRevalidateFetch(url);
    const json1 = await res1.json();
    assert.strictEqual(json1.version, 1);
    assert.strictEqual(fetchCallCount, 1);

    global.Date.now = () => realDateNow() + 10 * 60 * 1000;

    const res2 = await staleWhileRevalidateFetch(url);
    const json2 = await res2.json();

    assert.strictEqual(json2.version, 1);

    await new Promise(resolve => setTimeout(resolve, 10));

    assert.strictEqual(fetchCallCount, 2);

    const res3 = await staleWhileRevalidateFetch(url);
    const json3 = await res3.json();
    assert.strictEqual(json3.version, 2);
  } finally {
    global.fetch = originalFetch;
    global.Date.now = realDateNow;
    clearCache();
  }
});
