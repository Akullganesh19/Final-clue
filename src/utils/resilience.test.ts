import test from 'node:test';
import assert from 'node:assert';
import { withRetry, CircuitBreaker, CircuitState } from './resilience';

test('withRetry - succeeds on first attempt', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    return 'success';
  });

  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 1);
});

test('withRetry - succeeds after failures', async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error('temporary failure');
    }
    return 'success';
  }, { initialDelayMs: 10 }); // Faster tests

  assert.strictEqual(result, 'success');
  assert.strictEqual(attempts, 3);
});

test('withRetry - throws after max attempts', async () => {
  let attempts = 0;

  try {
    await withRetry(async () => {
      attempts++;
      throw new Error('persistent failure');
    }, { maxAttempts: 3, initialDelayMs: 10 });
    assert.fail('Should have thrown');
  } catch (err: any) {
    assert.strictEqual(err.message, 'persistent failure');
    assert.strictEqual(attempts, 3);
  }
});

test('CircuitBreaker - transitions to OPEN on failures', async () => {
  const cb = new CircuitBreaker('test1', { failureThreshold: 2, resetTimeoutMs: 100 });

  // Attempt 1 - fail
  await assert.rejects(
    cb.execute(async () => { throw new Error('fail'); })
  );
  assert.strictEqual(cb.getState(), CircuitState.CLOSED);

  // Attempt 2 - fail, threshold reached
  await assert.rejects(
    cb.execute(async () => { throw new Error('fail'); })
  );
  assert.strictEqual(cb.getState(), CircuitState.OPEN);
});

test('CircuitBreaker - uses fallback when OPEN', async () => {
  const cb = new CircuitBreaker('test2', { failureThreshold: 1, resetTimeoutMs: 100 });

  // Attempt 1 - fail, threshold reached
  await assert.rejects(
    cb.execute(async () => { throw new Error('fail'); })
  );
  assert.strictEqual(cb.getState(), CircuitState.OPEN);

  // Attempt 2 - should use fallback without executing function
  let fnExecuted = false;
  const result = await cb.execute(
    async () => { fnExecuted = true; return 'success'; },
    async () => 'fallback'
  );

  assert.strictEqual(result, 'fallback');
  assert.strictEqual(fnExecuted, false);
});

test('CircuitBreaker - transitions to HALF_OPEN and recovers', async () => {
  const cb = new CircuitBreaker('test3', { failureThreshold: 1, resetTimeoutMs: 50 });

  // Attempt 1 - fail, threshold reached -> OPEN
  await assert.rejects(
    cb.execute(async () => { throw new Error('fail'); })
  );

  // Wait for reset timeout
  await new Promise(r => setTimeout(r, 60));

  assert.strictEqual(cb.getState(), CircuitState.HALF_OPEN);

  // Attempt 2 - success -> CLOSED
  const result = await cb.execute(async () => 'success');

  assert.strictEqual(result, 'success');
  assert.strictEqual(cb.getState(), CircuitState.CLOSED);
});
