import { test, mock } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.ts';

test('generateAuditHash', async () => {
  const hash = await generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.ok(hash.startsWith('CHK-'));
});

test('createAuditLog', async () => {
  const logs = await createAuditLog([], 'ACTION', 'DETAILS');
  assert.strictEqual(logs.length, 1);
  assert.ok(logs[0].id.startsWith('AUDIT-'));
});
