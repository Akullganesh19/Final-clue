import test from 'node:test';
import assert from 'node:assert';
import { resilientFetch, clearExecutedOperations } from './apiClient';

// Ensure standard global crypto is available for tests
import crypto from 'node:crypto';
if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = crypto.webcrypto;
}

test('resilientFetch retries on failure', async (t) => {
  let attempts = 0;

  (globalThis as any).fetch = (async (url: string, options: any) => {
    attempts++;
    if (attempts < 3) {
      throw new Error('Network failure');
    }
    return { ok: true, status: 200 };
  }) as any;

  const response = await resilientFetch('http://example.com/api', {}, 3);

  assert.strictEqual(attempts, 3);
  assert.strictEqual(response.ok, true);
});

test('resilientFetch stops retrying after maxAttempts', async (t) => {
  let attempts = 0;

  (globalThis as any).fetch = (async (url: string, options: any) => {
    attempts++;
    throw new Error('Persistent network failure');
  }) as any;

  try {
    await resilientFetch('http://example.com/api', {}, 3);
    assert.fail('Should have thrown an error');
  } catch (err: any) {
    assert.strictEqual(err.message, 'Persistent network failure');
    assert.strictEqual(attempts, 3);
  }
});

test('resilientFetch protects mutating operations with idempotency guard', async (t) => {
  clearExecutedOperations();
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });

  // manually mock Date.now so it works correctly with node test runner timers
  const originalDateNow = globalThis.Date.now;
  globalThis.Date.now = () => new Date().getTime();

  let attempts = 0;

  (globalThis as any).fetch = (async (url: string, options: any) => {
    attempts++;
    return { ok: true, status: 200 };
  }) as any;

  const url = 'http://example.com/api/mutate';
  const options = { method: 'POST', body: JSON.stringify({ data: 'test' }) };

  // First call should succeed
  await resilientFetch(url, options);
  assert.strictEqual(attempts, 1);

  // Second call with same method/url/body should fail before fetching
  try {
    await resilientFetch(url, options);
    assert.fail('Should have blocked duplicate execution');
  } catch (err: any) {
    assert.ok(err.message.includes('Idempotency guard'), 'Should throw idempotency error');
    assert.strictEqual(attempts, 1, 'Fetch should not have been called a second time');
  }

  // Third call with different body should succeed
  const optionsDifferent = { method: 'POST', body: JSON.stringify({ data: 'different' }) };
  await resilientFetch(url, optionsDifferent);
  assert.strictEqual(attempts, 2);

  // Advance time beyond TTL
  t.mock.timers.tick(15000);

  // Fourth call with original body should succeed now
  await resilientFetch(url, options);
  assert.strictEqual(attempts, 3);

  globalThis.Date.now = originalDateNow;
});
