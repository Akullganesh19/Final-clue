import test from 'node:test';
import assert from 'node:assert';

test('request coalescing', async (t) => {
  let fetchCallCount = 0;

  const originalFetch = async (input: any, init?: any) => {
    fetchCallCount++;
    return {
      clone: () => ({ isClone: true }),
      isClone: false
    } as any;
  };

  globalThis.fetch = originalFetch;

  const { interceptFetch } = await import('./requestCoalescer.ts' + '?t=' + Date.now());

  interceptFetch();

  const p1 = globalThis.fetch('http://test.com');
  const p2 = globalThis.fetch('http://test.com');
  const p3 = globalThis.fetch('http://test.com');

  const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

  assert.strictEqual(fetchCallCount, 1);
  assert.strictEqual((r1 as any).isClone, true);
  assert.strictEqual((r2 as any).isClone, true);
  assert.strictEqual((r3 as any).isClone, false);
});
