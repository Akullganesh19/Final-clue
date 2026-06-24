import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog, redactPII } from './audit';
import { AuditTrail } from '../types';

test('redactPII redacts sensitive information', () => {
  assert.strictEqual(redactPII("Email: jsmith@gmail.com"), "Email: j***@gmail.com");
  assert.strictEqual(redactPII("SSN: 123-45-6789"), "SSN: ***-**-6789");
  assert.strictEqual(redactPII("CC: 1234-5678-9012-3456"), "CC: ****-****-****-3456");
  assert.strictEqual(redactPII("Phone: 123-456-7890"), "Phone: ***-***-7890");
  assert.strictEqual(redactPII("Phone: (123) 456-7890"), "Phone: ***-***-7890");
});

test('createAuditLog redacts PII before hashing and storing', () => {
  const logs: AuditTrail[] = [];
  const detailsWithPII = "User jsmith@gmail.com updated SSN to 123-45-6789";

  const newLogs = createAuditLog(logs, "UPDATE_USER", detailsWithPII);

  assert.strictEqual(newLogs.length, 1);
  assert.strictEqual(newLogs[0].details, "User j***@gmail.com updated SSN to ***-**-6789");
});
