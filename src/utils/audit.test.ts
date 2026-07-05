import { test } from 'node:test';
import * as assert from 'node:assert';
import { generateAuditHash } from './audit';

test('Delimiter Injection Vulnerability is Fixed', () => {
    // Attack scenario: User inputs a | to shift values
    const hash1 = generateAuditHash('PREV', 'ACTION', 'details|admin', 'user', '12345');
    const hash2 = generateAuditHash('PREV', 'ACTION|details', 'admin', 'user', '12345');

    assert.notStrictEqual(hash1, hash2, 'Hashes must not collide due to delimiter injection');
});
