import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2, createAuditLog } from './audit';

test('generateAuditHash works for legacy', () => {
  const hash = generateAuditHash('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  assert.ok(hash.startsWith('CHK-'));
});

test('generateAuditHashV2 protects against delimiter injection', async () => {
  const hash1 = await generateAuditHashV2('PREV', 'ACTION', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
  const hash2 = await generateAuditHashV2('PREV', 'ACTION', 'DETAILS|AUTHOR', '', 'TIMESTAMP');
  assert.notStrictEqual(hash1, hash2);
});
