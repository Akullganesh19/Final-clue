import test from 'node:test';
import assert from 'node:assert';
import { withRetry, callFragileDependency, resetFragileDependency } from '../server.ts';

test('Genesis Recovery: withRetry should succeed after initial failures', async () => {
  resetFragileDependency();

  // The fragile dependency fails on attempts 1 and 2, but succeeds on 3
  const result = await withRetry(callFragileDependency, 3);
  assert.deepStrictEqual(result, { data: 'Success data from fragile dependency' });
});

test('Genesis Recovery: withRetry should throw if all attempts fail', async () => {
  let attemptCount = 0;
  const constantlyFailingDependency = async () => {
    attemptCount++;
    throw new Error('Always fails');
  };

  try {
    await withRetry(constantlyFailingDependency, 2);
    assert.fail('Should have thrown an error');
  } catch (err: any) {
    assert.strictEqual(err.message, 'Always fails');
    assert.strictEqual(attemptCount, 2);
  }
});
