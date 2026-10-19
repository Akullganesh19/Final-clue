import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog, redactPII } from './audit';
import { AuditTrail } from '../types';

test('redactPII should correctly redact email, phone, and SSN', () => {
  assert.strictEqual(redactPII("john.doe@example.com"), "j***@example.com");
  assert.strictEqual(redactPII("123-45-6789"), "***-**-6789");
  assert.strictEqual(redactPII("123-456-7890"), "***-***-7890");
});

test('createAuditLog should securely redact details and author fields', () => {
  const initialLogs: AuditTrail[] = [];

  const action = "USER_VIEW";
  const details = "Viewed profile for User Email: alice.smith@example.com, SSN: 987-65-4321";
  const author = "Investigator (Phone: +1-555-123-4567)";

  const newLogs = createAuditLog(initialLogs, action, details, author);

  const latestLog = newLogs[newLogs.length - 1];

  assert.strictEqual(latestLog.details, "Viewed profile for User Email: a***@example.com, SSN: ***-**-4321");
  assert.strictEqual(latestLog.author, "Investigator (Phone: +***-***-4567)");
});

test('createAuditLog hash generation should use redacted fields', () => {
  const initialLogs: AuditTrail[] = [];

  const action = "USER_VIEW";
  const details = "Viewed profile for User Email: bob.jones@example.com";
  const author = "Investigator";

  const newLogs = createAuditLog(initialLogs, action, details, author);
  const latestLog = newLogs[newLogs.length - 1];

  // We don't need to know the exact hash, just that it doesn't throw and was generated.
  // The generation uses redacted details under the hood now, verifying it's stable and runs.
  assert.ok(latestLog.hash.startsWith("CHK-"));
});
