import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.js';
import { AuditTrail } from '../types.js';

test('createAuditLog generates unique IDs', () => {
    const logs1 = createAuditLog([], 'ACTION1', 'Detail 1', 'Admin');
    const logs2 = createAuditLog(logs1, 'ACTION2', 'Detail 2', 'Admin');
    assert.notStrictEqual(logs1[0].id, logs2[1].id);
});
