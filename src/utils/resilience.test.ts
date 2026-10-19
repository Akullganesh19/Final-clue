import { test } from 'node:test';
import * as assert from 'node:assert';
import { withRetry, CircuitBreaker } from './resilience';

test('withRetry successfully returns on first try', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    return 'success';
  };
  const result = await withRetry(fn);
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 1);
});

test('withRetry retries and succeeds', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };
  const result = await withRetry(fn, 3, 10);
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 3);
});

test('CircuitBreaker opens after failures', async () => {
  const cb = new CircuitBreaker(2, 100);
  let failures = 0;
  const fn = async () => {
    failures++;
    throw new Error('fail');
  };

  try { await cb.execute(fn); } catch (e) {}
  try { await cb.execute(fn); } catch (e) {}

  // Circuit should be OPEN now
  try {
    await cb.execute(fn);
    assert.fail('Should have thrown OPEN error');
  } catch (e: any) {
    assert.match(e.message, /OPEN/);
  }
});
