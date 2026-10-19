import { test, describe, beforeEach, mock } from 'node:test';
import * as assert from 'node:assert';
import { withRetry, globalIdempotencyGuard, IdempotencyGuard } from './recovery';

describe('Genesis Recovery Mechanisms', () => {
  beforeEach(() => {
    globalIdempotencyGuard.clear();
  });

  test('withRetry executes successfully on first try', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      return 'success';
    };

    const result = await withRetry(fn, { isIdempotent: true });
    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 1);
  });

  test('withRetry retries on failure and succeeds', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      if (attempts < 3) throw new Error('fail');
      return 'success';
    };

    const result = await withRetry(fn, {
      isIdempotent: true,
      maxAttempts: 3,
      baseDelayMs: 10
    });

    assert.strictEqual(result, 'success');
    assert.strictEqual(attempts, 3);
  });

  test('withRetry throws after max attempts', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      throw new Error('fail');
    };

    await assert.rejects(
      async () => await withRetry(fn, {
        isIdempotent: true,
        maxAttempts: 2,
        baseDelayMs: 10
      }),
      /fail/
    );
    assert.strictEqual(attempts, 2);
  });

  test('withRetry requires operationId for non-idempotent operations', async () => {
    const fn = async () => 'success';

    await assert.rejects(
      async () => await withRetry(fn, { isIdempotent: false }),
      /operationId is required for non-idempotent operations/
    );
  });

  test('withRetry prevents duplicate execution of non-idempotent operations', async () => {
    let attempts = 0;
    const fn = async () => {
      attempts++;
      return 'success';
    };

    const opId = 'test-op-1';

    // First run should succeed
    const result1 = await withRetry(fn, { operationId: opId, isIdempotent: false });
    assert.strictEqual(result1, 'success');
    assert.strictEqual(attempts, 1);

    // Second run with same operationId should fail
    await assert.rejects(
      async () => await withRetry(fn, { operationId: opId, isIdempotent: false }),
      /Operation test-op-1 already executed/
    );

    // Ensure fn wasn't called again
    assert.strictEqual(attempts, 1);
  });

  test('IdempotencyGuard blocks duplicate checks', () => {
    const guard = new IdempotencyGuard();
    assert.strictEqual(guard.check('op-2'), true);
    assert.strictEqual(guard.check('op-2'), false);

    guard.clear();
    assert.strictEqual(guard.check('op-2'), true);
  });
});
