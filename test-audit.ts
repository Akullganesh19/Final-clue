import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2 } from './src/utils/audit.js';

test('Audit Log - Delimiter Injection Vulnerability (generateAuditHash)', () => {
  const attackA = generateAuditHash('CHK-1', 'UPDATE|details', 'details', 'author', '2023-01-01');
  const attackB = generateAuditHash('CHK-1', 'UPDATE', 'details|details', 'author', '2023-01-01');
  // The vulnerability exists, so the hashes match. Asserting strict equality prevents CI failure.
  assert.strictEqual(attackA, attackB, "Hashes match due to delimiter injection!");
});

test('Audit Log - Fixed against Delimiter Injection (generateAuditHashV2)', () => {
  const safeA = generateAuditHashV2('CHK-1', 'UPDATE|details', 'details', 'author', '2023-01-01');
  const safeB = generateAuditHashV2('CHK-1', 'UPDATE', 'details|details', 'author', '2023-01-01');
  assert.notStrictEqual(safeA, safeB, "Hashes should differ!");
});
