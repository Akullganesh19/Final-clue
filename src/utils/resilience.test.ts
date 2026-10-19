import { test } from 'node:test';
import * as assert from 'node:assert';
import { withRetry, CircuitBreaker } from './resilience';

test('withRetry successfully resolves on first attempt', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    return 'success';
  };

  const result = await withRetry(fn, 3, 10, 'Test');
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 1);
});

test('withRetry successfully resolves after failures', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await withRetry(fn, 3, 10, 'Test');
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 3);
});

test('withRetry throws after max attempts', async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    throw new Error('fail');
  };

  try {
    await withRetry(fn, 3, 10, 'Test');
    assert.fail('Should have thrown');
  } catch (err: any) {
    assert.strictEqual(err.message, 'fail');
    assert.strictEqual(attempts, 3);
  }
});

test('CircuitBreaker transitions correctly', async () => {
  const cb = new CircuitBreaker('TestService', 2, 50); // 2 failures, 50ms cooldown
  let attempts = 0;

  const failingFn = async () => {
    attempts++;
    throw new Error('Service Down');
  };

  const successFn = async () => {
    attempts++;
    return 'OK';
  };

  assert.strictEqual(cb.getState(), 'CLOSED');

  // First failure
  await assert.rejects(cb.execute(failingFn));
  assert.strictEqual(cb.getState(), 'CLOSED');

  // Second failure -> Trips to OPEN
  await assert.rejects(cb.execute(failingFn));
  assert.strictEqual(cb.getState(), 'OPEN');

  // Third attempt should immediately fail without executing fn
  const attemptsBeforeOpen = attempts;
  await assert.rejects(cb.execute(successFn)); // Should fail because OPEN
  assert.strictEqual(attempts, attemptsBeforeOpen, 'Should not have executed fn when OPEN');

  // Wait for cooldown
  await new Promise(resolve => setTimeout(resolve, 60));

  // Should enter HALF_OPEN
  assert.strictEqual(cb.getState(), 'HALF_OPEN');

  // Execute success in HALF_OPEN -> transitions to CLOSED
  const result = await cb.execute(successFn);
  assert.strictEqual(result, 'OK');
  assert.strictEqual(cb.getState(), 'CLOSED');
});

test('CircuitBreaker uses fallback when OPEN', async () => {
  const cb = new CircuitBreaker('TestService', 1, 50); // 1 failure, 50ms cooldown

  const failingFn = async () => { throw new Error('Service Down'); };
  const fallbackFn = async () => 'FALLBACK';

  // First failure trips breaker
  const result1 = await cb.execute(failingFn, fallbackFn);
  assert.strictEqual(result1, 'FALLBACK');
  assert.strictEqual(cb.getState(), 'OPEN');

  // Second attempt uses fallback because OPEN
  const result2 = await cb.execute(async () => 'OK', fallbackFn);
  assert.strictEqual(result2, 'FALLBACK');
});
