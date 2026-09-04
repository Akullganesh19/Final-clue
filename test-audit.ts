import assert from 'assert';
import { test } from 'node:test';
import { generateAuditHash } from './src/utils/audit.js';

function legacyGenerateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): string {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return 'CHK-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

test('generateAuditHash - regression test', () => {
  const prevHash = "CHK-123";
  const timestamp = "2023-01-01T00:00:00Z";

  // Collision case for legacy hash
  const legacyHash1 = legacyGenerateAuditHash(prevHash, "EDIT_CASE|user1", "modified details", "admin", timestamp);
  const legacyHash2 = legacyGenerateAuditHash(prevHash, "EDIT_CASE", "user1|modified details", "admin", timestamp);
  assert.strictEqual(legacyHash1, legacyHash2, "Legacy function should exhibit collision");

  // Same inputs, but for new hash
  const hash1 = generateAuditHash(prevHash, "EDIT_CASE|user1", "modified details", "admin", timestamp);
  const hash2 = generateAuditHash(prevHash, "EDIT_CASE", "user1|modified details", "admin", timestamp);
  assert.notStrictEqual(hash1, hash2, "New function should not exhibit collision");
});
