import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog } from './audit.js';

test('createAuditLog redacts PII', () => {
    const logs = createAuditLog([], 'Log User Action', 'User details: john.doe@email.com, SSN: 123-45-6789, Phone: (555) 123-4567, Card: 1234-5678-9012-3456');
    const log = logs[0];
    assert.strictEqual(log.details, 'User details: j***@email.com, SSN: ***-**-6789, Phone: ***-***-4567, Card: ****-****-****-3456');
});
