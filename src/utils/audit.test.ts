import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash } from './audit';

test('generateAuditHash should not be vulnerable to delimiter injection', () => {
  const hash1 = generateAuditHash("ROOT", "CREATE_LINK", "CASE_A|CASE_B", "System", "2023-01-01T00:00:00Z");
  const hash2 = generateAuditHash("ROOT", "CREATE_LINK|CASE_A", "CASE_B", "System", "2023-01-01T00:00:00Z");

  // If delimiter injection exists, hash1 will equal hash2. We assert they must NOT be equal.
  assert.notStrictEqual(hash1, hash2, 'Hash collision detected due to delimiter injection');
});
