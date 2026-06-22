import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash } from '../src/utils/audit.ts';

test('Audit hash delimiter injection vulnerability is fixed', () => {
  const legitimateHash = generateAuditHash('PREV', 'UPDATE_ROLE', 'User', 'Admin|2023', 'Time');
  const forgedHash = generateAuditHash('PREV', 'UPDATE_ROLE|User', 'Admin', '2023', 'Time');
  assert.notStrictEqual(legitimateHash, forgedHash, 'Hashes should NOT collide. Fix should prevent delimiter injection.');
});
