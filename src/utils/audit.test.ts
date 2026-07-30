import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.js';

test('createAuditLog structurally redacts PII', () => {
  const logs: any[] = [];

  const updatedLogs = createAuditLog(
    logs,
    'VIEW_CASE',
    'Investigator reviewed case for jsmith@example.com, a@example.com, SSN 123-45-6789, Phone 555-123-4567',
    'Investigator jsmith@example.com'
  );

  assert.strictEqual(updatedLogs.length, 1);
  assert.strictEqual(
    updatedLogs[0].details,
    'Investigator reviewed case for j***@example.com, a***@example.com, SSN ***-**-6789, Phone ***-***-4567'
  );
  assert.strictEqual(updatedLogs[0].author, 'Investigator j***@example.com');
});
