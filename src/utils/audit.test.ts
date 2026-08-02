import test from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2, createAuditLog } from './audit';

test('generateAuditHash is vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHash('PREV', 'ACTION', 'DETAILS|AUTH', 'OR', 'TIME');
  const hash2 = generateAuditHash('PREV', 'ACTION|DETAILS', 'AUTH', 'OR', 'TIME');
  assert.strictEqual(hash1, hash2);
});

test('generateAuditHashV2 is secure against delimiter injection', () => {
  const hash1 = generateAuditHashV2('PREV', 'ACTION', 'DETAILS|AUTH', 'OR', 'TIME');
  const hash2 = generateAuditHashV2('PREV', 'ACTION|DETAILS', 'AUTH', 'OR', 'TIME');
  assert.notStrictEqual(hash1, hash2);
});
