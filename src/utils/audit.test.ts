import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.ts';

test('createAuditLog redact PII', () => {
  const logs = [];
  const newLogs = createAuditLog(
    logs,
    "Updated user record",
    "User email test@example.com phone is (123) 456-7890 and SSN 123-45-6789.",
    "Investigator"
  );

  assert.strictEqual(newLogs.length, 1);
  assert.strictEqual(
    newLogs[0].details,
    "User email t***@example.com phone is ***-***-7890 and SSN ***-**-6789."
  );
});
