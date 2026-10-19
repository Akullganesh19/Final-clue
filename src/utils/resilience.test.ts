import test from 'node:test';
import assert from 'node:assert';
import { withRetry, CircuitBreaker } from './resilience.js';

test('withRetry resolves on success', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    return 'success';
  }, 3, 10);
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 1);
});

test('withRetry retries on failure and eventually succeeds', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  }, 3, 10);
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 3);
});

test('withRetry fails after max attempts', async () => {
  let attempts = 0;
  try {
    await withRetry(async () => {
      attempts++;
      throw new Error('fail');
    }, 3, 10);
    assert.fail('Should have thrown');
  } catch (err: any) {
    assert.strictEqual(err.message, 'fail');
    assert.strictEqual(attempts, 3);
  }
});

test('CircuitBreaker opens after threshold and half-opens after cooldown', async () => {
  const cb = new CircuitBreaker(2, 50); // 2 failures, 50ms cooldown

  const failFn = async () => { throw new Error('fail'); };
  const successFn = async () => 'success';

  // Failure 1
  try { await cb.execute(failFn); } catch (e) {}
  assert.strictEqual(cb.state, 'CLOSED');

  // Failure 2 -> Threshold reached -> OPEN
  try { await cb.execute(failFn); } catch (e) {}
  assert.strictEqual(cb.state, 'OPEN');

  // Immediate retry fails fast
  try {
    await cb.execute(successFn);
    assert.fail('Should have thrown circuit open');
  } catch (e: any) {
    assert.strictEqual(e.message, 'Circuit is OPEN');
  }

  // Wait for cooldown
  await new Promise(resolve => setTimeout(resolve, 60));

  // Should now be HALF_OPEN, execute successFn, reset to CLOSED
  const result = await cb.execute(successFn);
  assert.strictEqual(result, 'success');
  assert.strictEqual(cb.state, 'CLOSED');
});
