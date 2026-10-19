import { test } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';

test('createAuditLog appends correctly without hash', () => {
  const logs = createAuditLog([], 'TEST', 'Details', 'Author');
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].action, 'TEST');
  assert.strictEqual((logs[0] as any).hash, undefined);
});
