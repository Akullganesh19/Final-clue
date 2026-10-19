import { test } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';

test('createAuditLog redacts sensitive PII from details and action', () => {
  const initialLogs: any[] = [];
  const action = 'User update john.doe@email.com';
  const details = 'Found SSN 123-45-6789 and CC 1234-5678-9012-3456 in case notes.';
  const author = 'Investigator (Arjun Som)';

  const logs = createAuditLog(initialLogs, action, details, author);

  assert.strictEqual(logs.length, 1);
  const log = logs[0];

  assert.strictEqual(log.action, 'User update j***@email.com');
  assert.strictEqual(log.details, 'Found SSN ***-**-**** and CC ****-****-****-**** in case notes.');
  assert.strictEqual(log.author, 'Investigator (Arjun Som)');
});
