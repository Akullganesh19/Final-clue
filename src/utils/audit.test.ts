import { test } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';

test('createAuditLog redacts PII in details', () => {
  const logs: any[] = [];
  const action = 'User Login';
  const details = 'User john.doe@example.com logged in with SSN 123-45-6789 and phone 555-123-4567';
  const newLogs = createAuditLog(logs, action, details);

  const createdLog = newLogs[0];
  assert.ok(createdLog.details.includes('j***@example.com'), 'Email should be redacted');
  assert.ok(!createdLog.details.includes('john.doe@example.com'), 'Original email should not be present');
  assert.ok(createdLog.details.includes('***-**-****'), 'SSN should be redacted');
  assert.ok(!createdLog.details.includes('123-45-6789'), 'Original SSN should not be present');
  assert.ok(createdLog.details.includes('***-***-****'), 'Phone should be redacted');
});
