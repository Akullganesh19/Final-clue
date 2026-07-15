import test from 'node:test';
import assert from 'node:assert';

let currentMockFetch: any = null;

// The delegator mock as instructed by memory!
globalThis.fetch = async (input: any, init: any) => {
  if (currentMockFetch) {
    return currentMockFetch(input, init);
  }
  return new Response();
};

test('requestCoalescer', async (t) => {
  // Dynamically import the module AFTER setting up the delegator mock
  const { initializeRequestCoalescer, _resetFetch } = await import('./requestCoalescer');

  t.afterEach(() => {
    _resetFetch();
    currentMockFetch = null;
  });

  await t.test('coalesces concurrent requests to the same URL', async () => {
    let callCount = 0;

    currentMockFetch = async (url: string | URL | Request, init?: RequestInit) => {
      callCount++;
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
      return new Response(JSON.stringify({ data: 'test' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    initializeRequestCoalescer();

    // Fire 3 requests concurrently
    const p1 = globalThis.fetch('https://api.example.com/data');
    const p2 = globalThis.fetch('https://api.example.com/data');
    const p3 = globalThis.fetch('https://api.example.com/data');

    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    // Should only trigger one actual network call
    assert.strictEqual(callCount, 1);

    // All responses should be readable independently (due to cloning)
    const d1 = await r1.json();
    const d2 = await r2.json();
    const d3 = await r3.json();

    assert.deepStrictEqual(d1, { data: 'test' });
    assert.deepStrictEqual(d2, { data: 'test' });
    assert.deepStrictEqual(d3, { data: 'test' });
  });

  await t.test('does not coalesce different URLs', async () => {
    let callCount = 0;

    currentMockFetch = async (url: string | URL | Request, init?: RequestInit) => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
      return new Response(JSON.stringify({ url: url.toString() }));
    };

    initializeRequestCoalescer();

    const p1 = globalThis.fetch('https://api.example.com/data1');
    const p2 = globalThis.fetch('https://api.example.com/data2');

    await Promise.all([p1, p2]);

    assert.strictEqual(callCount, 2);
  });

  await t.test('does not coalesce non-GET requests', async () => {
    let callCount = 0;

    currentMockFetch = async (url: string | URL | Request, init?: RequestInit) => {
      callCount++;
      await new Promise(resolve => setTimeout(resolve, 50));
      return new Response(JSON.stringify({ success: true }));
    };

    initializeRequestCoalescer();

    const p1 = globalThis.fetch('https://api.example.com/data', { method: 'POST', body: 'abc' });
    const p2 = globalThis.fetch('https://api.example.com/data', { method: 'POST', body: 'abc' });

    await Promise.all([p1, p2]);

    assert.strictEqual(callCount, 2);
  });
});
