import { generateAuditHash } from './audit';
import * as assert from 'node:assert';
import { test } from 'node:test';

test('Audit hash should not be susceptible to delimiter injection', () => {
  // Scenario 1: Action contains delimiter
  const hash1 = generateAuditHash('PREV', 'CREATE|user', 'admin', 'author', 'time');

  // Scenario 2: Details contains the shifted part
  const hash2 = generateAuditHash('PREV', 'CREATE', 'user|admin', 'author', 'time');

  // They should not match
  assert.notStrictEqual(hash1, hash2, 'Hash collision detected due to delimiter injection');
});
