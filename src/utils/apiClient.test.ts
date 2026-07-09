import test, { mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';

// Polyfill for TextEncoder and Web Crypto in the test environment if missing
if (!(globalThis as any).TextEncoder) {
  (globalThis as any).TextEncoder = class {
    encode(str: string) {
      return Buffer.from(str, 'utf-8');
    }
  };
}

if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = {
    subtle: {
      digest: async (algo: string, data: Uint8Array) => {
        const hash = crypto.createHash(algo.replace('-', '').toLowerCase());
        hash.update(data);
        return new Uint8Array(hash.digest()).buffer;
      }
    }
  };
}

test('apiClient with retry and idempotency', async (t) => {
  mock.timers.enable({ apis: ['setTimeout'] });

  let fetchCalls = 0;
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    fetchCalls++;
    if (init?.method === 'POST') {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as any;

  // Clear cache and dynamically import
  // Require cache clearing not easily available in ESM, we append a query string.
  // @ts-ignore
  const { dedupedFetch } = await import('./apiClient.ts?1');

  await t.test('prevents duplicate POST requests within TTL', async () => {
    fetchCalls = 0;
    const req1 = dedupedFetch('https://api.example.com/submit', { method: 'POST', body: JSON.stringify({ a: 1 }) });
    const req2 = dedupedFetch('https://api.example.com/submit', { method: 'POST', body: JSON.stringify({ a: 1 }) });

    await assert.rejects(
      async () => {
        await Promise.all([req1, req2]);
      },
      (err: Error) => {
        return err.message.includes('Duplicate request detected for operation');
      }
    );

    // Only one should have been sent to fetch
    assert.strictEqual(fetchCalls, 1);
  });

  await t.test('allows duplicate POST request after TTL expires', async () => {
    fetchCalls = 0;
    await dedupedFetch('https://api.example.com/submit', { method: 'POST', body: JSON.stringify({ b: 2 }) });

    // Advance time past the 10s TTL
    mock.timers.tick(10001);

    await dedupedFetch('https://api.example.com/submit', { method: 'POST', body: JSON.stringify({ b: 2 }) });

    assert.strictEqual(fetchCalls, 2);
  });

  await t.test('caches GET requests', async () => {
    fetchCalls = 0;

    const res1 = await dedupedFetch('https://api.example.com/data');
    const res2 = await dedupedFetch('https://api.example.com/data');

    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res2.status, 200);

    // Should only have called fetch once due to caching
    assert.strictEqual(fetchCalls, 1);
  });

  mock.timers.reset();
});
