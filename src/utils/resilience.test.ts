import { test, describe } from 'node:test';
import assert from 'node:assert';
import { withRetry, CircuitBreaker, CircuitBreakerState } from './resilience';

describe('withRetry', () => {
  test('should resolve immediately if function succeeds', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts++;
      return 'success';
    }, { baseDelayMs: 1 });

    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 1);
  });

  test('should retry until it succeeds', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts++;
      if (attempts < 3) throw new Error('transient failure');
      return 'success';
    }, { baseDelayMs: 1 });

    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 3);
  });

  test('should fail after maxAttempts', async () => {
    let attempts = 0;
    try {
      await withRetry(async () => {
        attempts++;
        throw new Error('permanent failure');
      }, { maxAttempts: 2, baseDelayMs: 1 });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.strictEqual(err.message, 'permanent failure');
      assert.strictEqual(attempts, 2);
    }
  });

  test('should not retry if isIdempotent is false', async () => {
    let attempts = 0;
    try {
      await withRetry(async () => {
        attempts++;
        throw new Error('failure');
      }, { isIdempotent: false, baseDelayMs: 1 });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.strictEqual(err.message, 'failure');
      assert.strictEqual(attempts, 1);
    }
  });
});

describe('CircuitBreaker', () => {
  test('should execute function when CLOSED', async () => {
    const cb = new CircuitBreaker();
    const result = await cb.execute(async () => 'success');
    assert.strictEqual(result, 'success');
    assert.strictEqual(cb.getState(), CircuitBreakerState.CLOSED);
  });

  test('should transition to OPEN after failureThreshold is reached', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 2 });

    try {
      await cb.execute(async () => { throw new Error('fail'); });
    } catch (e) {}
    assert.strictEqual(cb.getState(), CircuitBreakerState.CLOSED);

    try {
      await cb.execute(async () => { throw new Error('fail'); });
    } catch (e) {}
    assert.strictEqual(cb.getState(), CircuitBreakerState.OPEN);
  });

  test('should return fallback when OPEN', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1 });
    try {
      await cb.execute(async () => { throw new Error('fail'); });
    } catch (e) {}

    assert.strictEqual(cb.getState(), CircuitBreakerState.OPEN);

    const result = await cb.execute(async () => 'success', () => 'fallback');
    assert.strictEqual(result, 'fallback');
  });

  test('should throw if OPEN and no fallback', async () => {
    const cb = new CircuitBreaker({ failureThreshold: 1 });
    try {
      await cb.execute(async () => { throw new Error('fail'); });
    } catch (e) {}

    assert.strictEqual(cb.getState(), CircuitBreakerState.OPEN);

    try {
      await cb.execute(async () => 'success');
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.match(err.message, /is OPEN/);
    }
  });
});
