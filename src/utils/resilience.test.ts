import { test } from 'node:test';
import * as assert from 'node:assert';
import { withRetry, CircuitBreaker } from './resilience';

test('withRetry resolves when function succeeds on first try', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    return 'success';
  });
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 1);
});

test('withRetry retries and succeeds', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('fail');
    }
    return 'success';
  }, 3, 10);
  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 3);
});

test('withRetry throws after max attempts', async () => {
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

test('CircuitBreaker transitions to OPEN after threshold failures', async () => {
  const breaker = new CircuitBreaker(2, 100);

  // Failure 1
  try { await breaker.execute(async () => { throw new Error('fail1'); }); } catch (e) {}

  // Failure 2 (Threshold reached, opens circuit)
  try { await breaker.execute(async () => { throw new Error('fail2'); }); } catch (e) {}

  // Should immediately throw circuit OPEN error
  try {
    await breaker.execute(async () => 'success');
    assert.fail('Should have thrown OPEN error');
  } catch (err: any) {
    assert.strictEqual(err.message, 'Circuit is OPEN');
  }
});

test('CircuitBreaker transitions to HALF_OPEN and resets after timeout', async () => {
  const breaker = new CircuitBreaker(2, 50);

  // Open circuit
  try { await breaker.execute(async () => { throw new Error('fail'); }); } catch (e) {}
  try { await breaker.execute(async () => { throw new Error('fail'); }); } catch (e) {}

  // Wait for timeout
  await new Promise(resolve => setTimeout(resolve, 60));

  // Should succeed and reset to CLOSED
  const result = await breaker.execute(async () => 'success');
  assert.strictEqual(result, 'success');

  // Next call should also succeed
  const result2 = await breaker.execute(async () => 'success2');
  assert.strictEqual(result2, 'success2');
});
