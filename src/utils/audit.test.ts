import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('Audit System Integrity', () => {
  it('prevents hash collisions via delimiter injection', () => {
    // Attack scenario: malicious user inserts delimiters to masquerade as another action
    // In old implementation, previousHash="PREV", action="act|ion", details="details"
    // collided with previousHash="PREV", action="act", details="ion|details"
    const h1 = generateAuditHash('PREV', 'act', 'ion|details', 'author', 'time');
    const h2 = generateAuditHash('PREV', 'act|ion', 'details', 'author', 'time');

    assert.notStrictEqual(h1, h2, 'Hash collision detected! Delimiter injection vulnerability exists.');
  });

  it('enforces idempotency to prevent duplicated logs', () => {
    const logs: AuditTrail[] = [];

    // First call succeeds
    const newLogs = createAuditLog(logs, 'LOGIN', 'Success', 'user_123', 'Investigator');
    assert.strictEqual(newLogs.length, 1);

    // Second call with same idempotencyKey should return existing state
    const duplicateLogs = createAuditLog(newLogs, 'LOGIN', 'Success', 'user_123', 'Investigator');
    assert.strictEqual(duplicateLogs.length, 1);

    // Call with new idempotencyKey should succeed
    const finalLogs = createAuditLog(newLogs, 'LOGOUT', 'Success', 'user_456', 'Investigator');
    assert.strictEqual(finalLogs.length, 2);
  });
});
