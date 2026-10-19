import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('Audit logs generate unique IDs under high concurrency', () => {
    const logs: AuditTrail[] = [];
    const generatedIds = new Set<string>();
    let collisions = 0;

    // Simulate high concurrency generation within the same ms by mocking Date.now
    const originalDateNow = Date.now;
    Date.now = () => 1629880000000;

    try {
        for (let i = 0; i < 1000; i++) {
            const newLogs = createAuditLog(logs, 'ACTION', 'DETAILS');
            const newLog = newLogs[newLogs.length - 1];
            if (generatedIds.has(newLog.id)) {
                collisions++;
            }
            generatedIds.add(newLog.id);
        }

        assert.strictEqual(collisions, 0, `Expected 0 collisions, but found ${collisions}`);
    } finally {
        Date.now = originalDateNow;
    }
});
