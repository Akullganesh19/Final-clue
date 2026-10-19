import { generateAuditHash, createAuditLog } from './audit.js';
import assert from 'node:assert';
import test from 'node:test';

test('Audit - ID collision test', () => {
    let createdLogs: any[] = [];
    for (let i = 0; i < 2000; i++) {
        createdLogs = createAuditLog(createdLogs, 'TEST', 'Details', 'Author');
    }
    const ids = new Set(createdLogs.map(l => l.id));
    assert.strictEqual(ids.size, 2000, 'Concurrency ID collision detected');
});

test('Audit - Delimiter injection test', () => {
    const hash1 = generateAuditHash('PREV', 'LOGIN', 'Success|User1', 'Admin', '2023-01-01T00:00:00.000Z');
    const hash2 = generateAuditHash('PREV', 'LOGIN|Success', 'User1', 'Admin', '2023-01-01T00:00:00.000Z');
    assert.notStrictEqual(hash1, hash2, 'Delimiter injection vulnerability detected');
});
