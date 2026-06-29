import { test } from 'node:test';
import * as assert from 'node:assert';
import { withRetry, CircuitBreaker, CircuitState } from './resilience';

test('withRetry succeeds on first attempt', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    return 'success';
  }, { maxAttempts: 3, baseDelayMs: 1 });

  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 1);
});

test('withRetry retries and succeeds', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  }, { maxAttempts: 3, baseDelayMs: 1 });

  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 3);
});

test('withRetry fails after max attempts', async () => {
  let attempts = 0;
  try {
    await withRetry(async () => {
      attempts++;
      throw new Error('fail');
    }, { maxAttempts: 3, baseDelayMs: 1 });
    assert.fail('Should have thrown');
  } catch (err: any) {
    assert.strictEqual(err.message, 'fail');
    assert.strictEqual(attempts, 3);
  }
});

test('CircuitBreaker trips after failure threshold', async () => {
  const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownPeriodMs: 50 });

  // Attempt 1: fail (closed -> closed)
  try { await breaker.execute(async () => { throw new Error('fail 1'); }); } catch (e) {}
  assert.strictEqual(breaker.getState(), CircuitState.CLOSED);

  // Attempt 2: fail (closed -> open)
  try { await breaker.execute(async () => { throw new Error('fail 2'); }); } catch (e) {}
  assert.strictEqual(breaker.getState(), CircuitState.OPEN);

  // Attempt 3: fail fast without executing (open -> open)
  let executed = false;
  try {
    await breaker.execute(async () => { executed = true; return 'ok'; });
    assert.fail('Should fail fast');
  } catch (err: any) {
    assert.strictEqual(err.message, 'Circuit breaker is OPEN. Fast-failing request.');
    assert.strictEqual(executed, false);
  }
});

test('CircuitBreaker recovers after cooldown', async () => {
  const breaker = new CircuitBreaker({ failureThreshold: 1, cooldownPeriodMs: 50 });

  // Fail to open circuit
  try { await breaker.execute(async () => { throw new Error('fail'); }); } catch (e) {}
  assert.strictEqual(breaker.getState(), CircuitState.OPEN);

  // Wait for cooldown
  await new Promise(resolve => setTimeout(resolve, 60));

  // Half-open test succeeds -> Closed
  const result = await breaker.execute(async () => 'recovered');
  assert.strictEqual(result, 'recovered');
  assert.strictEqual(breaker.getState(), CircuitState.CLOSED);
});
