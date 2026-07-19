import test from 'node:test';
import assert from 'node:assert';

let currentMockFetch: any;
globalThis.fetch = async (input, init) => currentMockFetch(input, init);

test('Fetch Coalescer', async (t) => {
  // Dynamically import to ensure mock capture
  const { setupFetchCoalescing } = await import('./fetchCoalescer');

  await t.test('coalesces identical requests', async () => {
    let callCount = 0;
    currentMockFetch = async (input: any, init: any) => {
      callCount++;
      return new Response('ok');
    };

    // Install
    delete (globalThis.fetch as any).__coalescer_installed;
    setupFetchCoalescing();

    const p1 = globalThis.fetch('https://api.example.com/data');
    const p2 = globalThis.fetch('https://api.example.com/data');

    await Promise.all([p1, p2]);

    assert.strictEqual(callCount, 1, 'Should only hit network once');
  });

  await t.test('degrades gracefully with AbortSignal', async () => {
    let callCount = 0;
    currentMockFetch = async (input: any, init: any) => {
      callCount++;
      return new Response('ok');
    };

    delete (globalThis.fetch as any).__coalescer_installed;
    setupFetchCoalescing();

    const controller1 = new AbortController();
    const controller2 = new AbortController();

    const p1 = globalThis.fetch('https://api.example.com/data', { signal: controller1.signal });
    const p2 = globalThis.fetch('https://api.example.com/data', { signal: controller2.signal });

    await Promise.all([p1, p2]);

    assert.strictEqual(callCount, 2, 'Should not coalesce if AbortSignal is present');
  });

  await t.test('differentiates based on headers', async () => {
     let callCount = 0;
    currentMockFetch = async (input: any, init: any) => {
      callCount++;
      return new Response('ok');
    };

    delete (globalThis.fetch as any).__coalescer_installed;
    setupFetchCoalescing();

    const p1 = globalThis.fetch('https://api.example.com/data', { headers: { 'X-Custom': '1' } });
    const p2 = globalThis.fetch('https://api.example.com/data', { headers: { 'X-Custom': '2' } });

    await Promise.all([p1, p2]);

    assert.strictEqual(callCount, 2, 'Should not coalesce different headers');
  });
});
