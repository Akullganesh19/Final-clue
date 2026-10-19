import { generateAuditHash, createAuditLog } from './audit';
import assert from 'node:assert/strict';
import test from 'node:test';

test('delimiter injection regression test', () => {
    const hash1 = generateAuditHash('PREV', 'ACTION|EXTRA', 'DETAILS', 'AUTHOR', 'TIMESTAMP');
    const hash2 = generateAuditHash('PREV', 'ACTION', 'EXTRA|DETAILS', 'AUTHOR', 'TIMESTAMP');
    assert.notEqual(hash1, hash2, 'Delimiter injection vulnerability exists: hashes should not match');
});

test('createAuditLog id should be UUID', () => {
    const logs = createAuditLog([], 'ACTION', 'DETAILS');
    const newLog = logs[0];

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    assert.match(newLog.id, uuidRegex, 'ID should be a cryptographically secure UUID');
});
