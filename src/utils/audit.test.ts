import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('Audit Utility Adversarial Tests', () => {
  it('generateAuditHash should not collide due to delimiter injection', () => {
    // Attack: Injecting the delimiter '|' to create identical payload strings
    const hash1 = generateAuditHash("A", "B|C", "D", "E", "F");
    const hash2 = generateAuditHash("A", "B", "C|D", "E", "F");

    // The hashes should be different because the inputs are semantically different
    assert.notStrictEqual(hash1, hash2, 'Hash collision detected! Delimiter injection succeeded.');
  });

  it('createAuditLog should generate strictly unique IDs under concurrency', () => {
    const logs: AuditTrail[] = [];
    const createdLogs: AuditTrail[] = [];

    // Attack: Simulate multiple calls happening in the same millisecond
    // Since Date.now() + Math.random() is naive, there's a theoretical risk of collision
    // but practically we'll generate many to verify
    for(let i=0; i<1000; i++) {
        // Mock a fast synchronous loop
        const result = createAuditLog(logs, `ACTION_${i}`, `DETAILS_${i}`, "TEST");
        createdLogs.push(result[result.length - 1]);
    }

    const ids = createdLogs.map(log => log.id);
    const uniqueIds = new Set(ids);

    // Even over 1000 fast iterations, every ID must be unique
    assert.strictEqual(ids.length, uniqueIds.size, 'ID collision detected in createAuditLog!');
  });
});
