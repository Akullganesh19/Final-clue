import test from 'node:test';
import assert from 'node:assert';
import { dedupedFetch } from './apiClient';

test('dedupedFetch - coalesces concurrent identical requests', async (t) => {
  let fetchCount = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: any) => {
    fetchCount++;
    return new Response(url);
  }) as any;

  const { dedupedFetch } = await import('./apiClient.ts?1');

  const url = 'https://api.example.com/data';

  // Both fetches fired synchronously, so they should coalesce into 1 inflight request.
  const p1 = dedupedFetch(url);
  const p2 = dedupedFetch(url);

  const [res1, res2] = await Promise.all([p1, p2]);

  assert.strictEqual(fetchCount, 1, 'fetch should only be called once');
  assert.strictEqual(await res1.text(), url);
  assert.strictEqual(await res2.text(), url);
});

test('dedupedFetch - bypasses cache for POST requests', async (t) => {
  let fetchCount = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: any, init: any) => {
    fetchCount++;
    return new Response(url + init.method);
  }) as any;

  const { dedupedFetch } = await import('./apiClient.ts?2');

  const url = 'https://api.example.com/data';
  const init = { method: 'POST' };

  const p1 = dedupedFetch(url, init);
  const p2 = dedupedFetch(url, init);

  const [res1, res2] = await Promise.all([p1, p2]);

  assert.strictEqual(fetchCount, 2, 'fetch should be called twice for POST');
  assert.strictEqual(await res1.text(), 'https://api.example.com/dataPOST');
  assert.strictEqual(await res2.text(), 'https://api.example.com/dataPOST');
});

test('dedupedFetch - caches successful GET requests', async (t) => {
  let fetchCount = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (url: any) => {
    fetchCount++;
    return new Response(url);
  }) as any;

  const { dedupedFetch } = await import('./apiClient.ts?3');

  const url = 'https://api.example.com/data-cache';

  // First fetch hits network
  const res1 = await dedupedFetch(url);
  assert.strictEqual(fetchCount, 1);
  assert.strictEqual(await res1.text(), url);

  // Second fetch hits cache
  const res2 = await dedupedFetch(url);
  assert.strictEqual(fetchCount, 1, 'fetch count should not increase due to cache hit');
  assert.strictEqual(await res2.text(), url);
});
