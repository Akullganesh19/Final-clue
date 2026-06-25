import { describe, it } from 'node:test';
import assert from 'node:assert';
import { withRetry, CircuitBreaker } from './resilience.js';

describe('Resilience Utilities', () => {
  describe('withRetry', () => {
    it('should return result if function succeeds first time', async () => {
      const result = await withRetry(async () => 'success');
      assert.strictEqual(result, 'success');
    });

    it('should retry and succeed if function fails then succeeds', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts === 1) throw new Error('fail');
        return 'success';
      };

      const result = await withRetry(fn, 3, 10);
      assert.strictEqual(result, 'success');
      assert.strictEqual(attempts, 2);
    });

    it('should throw error if max attempts reached', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        throw new Error('fail');
      };

      await assert.rejects(
        () => withRetry(fn, 3, 10),
        /fail/
      );
      assert.strictEqual(attempts, 3);
    });
  });

  describe('CircuitBreaker', () => {
    it('should return result if operation succeeds', async () => {
      const cb = new CircuitBreaker(3, 1000);
      const result = await cb.execute(async () => 'success', async () => 'fallback');
      assert.strictEqual(result, 'success');
    });

    it('should return fallback if operation fails', async () => {
      const cb = new CircuitBreaker(3, 1000);
      const result = await cb.execute(async () => { throw new Error('fail'); }, async () => 'fallback');
      assert.strictEqual(result, 'fallback');
    });

    it('should open circuit after failure threshold and return fallback without trying operation', async () => {
      const cb = new CircuitBreaker(2, 1000);

      // Attempt 1 - fails
      await cb.execute(async () => { throw new Error('fail'); }, async () => 'fallback');

      // Attempt 2 - fails (circuit trips)
      await cb.execute(async () => { throw new Error('fail'); }, async () => 'fallback');

      // Attempt 3 - operation should not be called, circuit is open
      let opCalled = false;
      const result = await cb.execute(async () => { opCalled = true; return 'success'; }, async () => 'fallback');

      assert.strictEqual(result, 'fallback');
      assert.strictEqual(opCalled, false);
    });
  });
});
