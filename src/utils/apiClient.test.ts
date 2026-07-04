import { test } from 'node:test';
import * as assert from 'node:assert';
import { dedupedFetch, fetchCache, withRetry, generateCacheKey } from './apiClient';

test('apiClient tests', async (t) => {
  // Store original fetch
  const originalFetch = globalThis.fetch;

  t.afterEach(() => {
    // Restore fetch and clear cache after each test
    globalThis.fetch = originalFetch;
    fetchCache.clear();
  });

  await t.test('withRetry should retry on failure and eventually succeed', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts++;
      if (attempts < 3) throw new Error('Fail');
      return 'Success';
    }, 3, 10); // Use small delay for faster tests

    assert.strictEqual(result, 'Success');
    assert.strictEqual(attempts, 3);
  });

  await t.test('withRetry should throw if max attempts reached', async () => {
    let attempts = 0;
    try {
      await withRetry(async () => {
        attempts++;
        throw new Error('Fail');
      }, 3, 10);
      assert.fail('Should have thrown');
    } catch (e) {
      assert.strictEqual(attempts, 3);
      assert.strictEqual((e as Error).message, 'Fail');
    }
  });

  await t.test('generateCacheKey should serialize headers correctly', () => {
    const key1 = generateCacheKey('http://test.com', { headers: { 'a': '1', 'b': '2' } });
    const key2 = generateCacheKey('http://test.com', { headers: new Headers({ 'b': '2', 'a': '1' }) });
    assert.strictEqual(key1, key2);
  });

  await t.test('dedupedFetch throws if non-idempotent without idempotencyKey', async () => {
    try {
      await dedupedFetch('http://test.com', { method: 'POST' });
      assert.fail('Should have thrown');
    } catch (e) {
      assert.match((e as Error).message, /Non-idempotent operations must provide an idempotencyKey/);
    }
  });

  await t.test('dedupedFetch succeeds for non-idempotent with idempotencyKey', async () => {
    globalThis.fetch = async (input, init) => {
      return new Response('ok', { status: 200 });
    };

    const res = await dedupedFetch('http://test.com', {
      method: 'POST',
      idempotencyKey: 'test-key'
    });

    assert.strictEqual(res.status, 200);
  });

  await t.test('dedupedFetch coalesces concurrent identical requests and clones responses', async () => {
    let fetchCalls = 0;
    globalThis.fetch = async () => {
      fetchCalls++;
      // Add delay to ensure coalescing happens
      await new Promise(resolve => setTimeout(resolve, 50));
      return new Response('{"data": 1}', { status: 200 });
    };

    // Fire two requests concurrently
    const [res1, res2] = await Promise.all([
      dedupedFetch('http://test.com'),
      dedupedFetch('http://test.com')
    ]);

    assert.strictEqual(fetchCalls, 1);

    // Both responses should be readable independently
    const text1 = await res1.text();
    const text2 = await res2.text();

    assert.strictEqual(text1, '{"data": 1}');
    assert.strictEqual(text2, '{"data": 1}');
  });
});
