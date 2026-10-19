import { describe, it } from 'node:test';
import assert from 'node:assert';

let fetchCallCount = 0;
let currentMockFetch = async (input: any, init?: any): Promise<Response> => {
  fetchCallCount++;
  // simulate some latency
  await new Promise(resolve => setTimeout(resolve, 50));
  return new Response(JSON.stringify({ input: input.toString(), success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

globalThis.fetch = async (input, init) => currentMockFetch(input, init);

describe('Request Coalescer', async () => {
  it('coalesces concurrent GET requests', async () => {
    fetchCallCount = 0;

    // Dynamically import the module so it captures our mock fetch
    const network = await import('./network.ts');
    network.installRequestCoalescer();

    const p1 = globalThis.fetch('https://api.example.com/data');
    const p2 = globalThis.fetch('https://api.example.com/data');
    const p3 = globalThis.fetch('https://api.example.com/data');

    const [res1, res2, res3] = await Promise.all([p1, p2, p3]);

    // All should be able to read the body because of cloning
    const data1 = await res1.json();
    const data2 = await res2.json();
    const data3 = await res3.json();

    assert.deepStrictEqual(data1, { input: 'https://api.example.com/data', success: true });
    assert.deepStrictEqual(data2, { input: 'https://api.example.com/data', success: true });
    assert.deepStrictEqual(data3, { input: 'https://api.example.com/data', success: true });

    // The real fetch should only have been called ONCE despite 3 concurrent requests
    assert.strictEqual(fetchCallCount, 1);
  });

  it('does not coalesce non-GET requests', async () => {
    fetchCallCount = 0;

    const p1 = globalThis.fetch('https://api.example.com/data', { method: 'POST' });
    const p2 = globalThis.fetch('https://api.example.com/data', { method: 'POST' });

    await Promise.all([p1, p2]);

    // Should be called twice since it's POST
    assert.strictEqual(fetchCallCount, 2);
  });

  it('does not coalesce requests with AbortSignal', async () => {
    fetchCallCount = 0;
    const controller = new AbortController();

    const p1 = globalThis.fetch('https://api.example.com/data', { signal: controller.signal });
    const p2 = globalThis.fetch('https://api.example.com/data', { signal: controller.signal });

    await Promise.all([p1, p2]);

    // Should be called twice since they have signals
    assert.strictEqual(fetchCallCount, 2);
  });

  it('does not coalesce requests with different headers', async () => {
    fetchCallCount = 0;

    const p1 = globalThis.fetch('https://api.example.com/data', { headers: { 'Authorization': 'Bearer 1' } });
    const p2 = globalThis.fetch('https://api.example.com/data', { headers: { 'Authorization': 'Bearer 2' } });
    const p3 = globalThis.fetch('https://api.example.com/data', { headers: { 'Authorization': 'Bearer 1' } });

    await Promise.all([p1, p2, p3]);

    // Should be called twice, once for Bearer 1 (coalesced), once for Bearer 2
    assert.strictEqual(fetchCallCount, 2);
  });
});
