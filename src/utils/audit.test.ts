import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit.js';

test('delimiter injection causes hash collision (before fix)', () => {
  const hash1 = generateAuditHash('PREV', 'action|with|pipe', 'details', 'author', 'time');
  const hash2 = generateAuditHash('PREV', 'action', 'with|pipe|details', 'author', 'time');
  // We want the test to fail when there's a vulnerability, but pass when it's fixed.
  // Wait, the prompt says "Add a regression test that fails before your fix and passes after".
  // Let's assert that hash1 !== hash2 so it fails now (because they do equal) and passes later.
  assert.notStrictEqual(hash1, hash2, 'Hashes should not collide with delimiter injection');
});

test('idempotency check prevents duplicate logs', () => {
  const logs = [];
  const logs1 = createAuditLog(logs, 'ACTION', 'DETAILS', 'AUTHOR', 'idempotent-key-1');
  const logs2 = createAuditLog(logs1, 'ACTION', 'DETAILS', 'AUTHOR', 'idempotent-key-1');

  assert.strictEqual(logs1.length, 1, 'First log created');
  assert.strictEqual(logs2.length, 1, 'Duplicate log prevented by idempotency key');
  assert.strictEqual(logs1, logs2, 'Should return unmodified logs reference');
});
