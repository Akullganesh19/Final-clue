import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHashAsync, createAuditLogAsync } from './audit';

test('generateAuditHashAsync generates a 12 character hash starting with CHK-', async () => {
  const hash = await generateAuditHashAsync('prev', 'action', 'details', 'author', 'time');
  assert.ok(hash.startsWith('CHK-'));
  assert.strictEqual(hash.length, 12);
});

test('createAuditLogAsync appends a new log with an async hash', async () => {
  const logs = await createAuditLogAsync([], 'action', 'details');
  assert.strictEqual(logs.length, 1);
  assert.strictEqual(logs[0].action, 'action');
  assert.strictEqual(logs[0].details, 'details');
  assert.ok(logs[0].hash.startsWith('CHK-'));
  assert.strictEqual(logs[0].hash.length, 12);
});
