import test from 'node:test';
import assert from 'node:assert';
import { dedupedFetch } from './apiClient.js';
import { CircuitBreaker } from './resilience.js';

test('dedupedFetch coalesces requests', async () => {
  let callCount = 0;

  // Mock global fetch for this test
  const originalFetch = global.fetch;
  global.fetch = async (url: any, options: any) => {
    callCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
    return {
      ok: true,
      json: async () => ({ data: 'test' })
    } as Response;
  };

  try {
    const [res1, res2] = await Promise.all([
      dedupedFetch('/api/test'),
      dedupedFetch('/api/test')
    ]);

    assert.deepStrictEqual(res1, { data: 'test' });
    assert.deepStrictEqual(res2, { data: 'test' });
    assert.strictEqual(callCount, 1); // Should only be called once
  } finally {
    global.fetch = originalFetch;
  }
});
