import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';

test('createAuditLog works', () => {
  const originalDate = global.Date;

  class MockDate extends Date {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super('2023-01-01T00:00:00.000Z');
      } else {
        super(...args as [any]);
      }
    }
    static now() {
      return 100000;
    }
  }

  global.Date = MockDate as DateConstructor;

  const originalMathRandom = Math.random;
  Math.random = () => 0.5;

  try {
    const logs = createAuditLog([], 'ACTION', 'DETAILS', 'AUTHOR');
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].action, 'ACTION');
    assert.strictEqual(logs[0].details, 'DETAILS');
    assert.strictEqual(logs[0].author, 'AUTHOR');
    assert.strictEqual(logs[0].timestamp, '2023-01-01T00:00:00.000Z');
    assert.strictEqual(logs[0].id, 'AUDIT-100000-500');
    assert.strictEqual(logs[0].hash, 'CHK-7A1C3620');
  } finally {
    global.Date = originalDate;
    Math.random = originalMathRandom;
  }
});
