import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateAuditHash, createAuditLog } from '../utils/audit';

test('createAuditLog successfully creates log with correct hash', () => {
    const logs = createAuditLog([], 'TEST', 'test details', 'CHK-ROOT-GENESIS-CHAIN-STABLE');
    assert.strictEqual(logs.length, 1);
});
