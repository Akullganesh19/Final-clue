import test from 'node:test';
import assert from 'node:assert';

let mockFetchCalls = 0;
let currentMockFetch = async (input: any, init?: any): Promise<any> => {
  mockFetchCalls++;
  return new Response("ok");
};

test('Request coalescer tests', async (t) => {
  mockFetchCalls = 0;

  globalThis.fetch = async (input: any, init?: any) => currentMockFetch(input, init);

  const { installRequestCoalescer } = await import('./requestCoalescer.ts?v=' + Date.now());
  installRequestCoalescer();

  await t.test('Request coalescer groups simultaneous GET requests', async () => {
    mockFetchCalls = 0;

    let resolveFetch: (val: any) => void;
    let p = new Promise<Response>(resolve => {
      resolveFetch = resolve;
    });

    currentMockFetch = async (input: any, init?: any) => {
      mockFetchCalls++;
      return p;
    };

    const p1 = globalThis.fetch('https://example.com/api/data');
    const p2 = globalThis.fetch('https://example.com/api/data');

    await new Promise(r => setTimeout(r, 10));

    resolveFetch!(new Response("ok"));

    const [r1, r2] = await Promise.all([p1, p2]);

    assert.strictEqual(mockFetchCalls, 1);
    assert.strictEqual(await r1.text(), "ok");
    assert.strictEqual(await r2.text(), "ok");
  });

  await t.test('Request coalescer does not group POST requests', async () => {
    mockFetchCalls = 0;
    currentMockFetch = async (input: any, init?: any) => {
      mockFetchCalls++;
      return new Response("ok");
    };

    await Promise.all([
      globalThis.fetch('https://example.com/api/data', { method: 'POST' }),
      globalThis.fetch('https://example.com/api/data', { method: 'POST' })
    ]);

    assert.strictEqual(mockFetchCalls, 2);
  });

  await t.test('Request coalescer skips requests with AbortSignal', async () => {
    mockFetchCalls = 0;
    currentMockFetch = async (input: any, init?: any) => {
      mockFetchCalls++;
      return new Response("ok");
    };

    const controller1 = new AbortController();
    const controller2 = new AbortController();

    await Promise.all([
      globalThis.fetch('https://example.com/api/data', { signal: controller1.signal }),
      globalThis.fetch('https://example.com/api/data', { signal: controller2.signal })
    ]);

    assert.strictEqual(mockFetchCalls, 2);
  });

  await t.test('Request coalescer separates differing headers', async () => {
    mockFetchCalls = 0;
    currentMockFetch = async (input: any, init?: any) => {
      mockFetchCalls++;
      return new Response("ok");
    };

    const p1 = globalThis.fetch('https://example.com/api/auth', { headers: { 'Authorization': 'Bearer A' } });
    const p2 = globalThis.fetch('https://example.com/api/auth', { headers: { 'Authorization': 'Bearer B' } });

    await Promise.all([p1, p2]);

    assert.strictEqual(mockFetchCalls, 2);
  });
});
