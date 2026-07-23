import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAuditHashAsync, createAuditLogAsync } from './audit.js';

test('generateAuditHashAsync generates stable SHA-256 derived hashes', async () => {
  const hash = await generateAuditHashAsync('prev', 'action', 'details', 'author', 'time');
  assert.match(hash, /^CHK-[0-9A-F]{8}$/);
  const hash2 = await generateAuditHashAsync('prev', 'action', 'details', 'author', 'time');
  assert.equal(hash, hash2);
});

test('createAuditLogAsync creates logs with UUIDs and new hashes', async () => {
  const logs = await createAuditLogAsync([], 'action', 'details');
  assert.equal(logs.length, 1);
  assert.match(logs[0].id, /^AUDIT-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.match(logs[0].hash, /^CHK-[0-9A-F]{8}$/);
});
