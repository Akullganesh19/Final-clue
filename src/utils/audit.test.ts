import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog } from './audit';

test('redacts PII from audit log details', () => {
  const logs: any = [];
  const action = "User created account for john.doe@example.com";
  const details = "SSN 123-45-6789 and phone 555-123-4567 provided.";
  const newLogs = createAuditLog(logs, action, details, "Admin");

  const log = newLogs[0];
  assert.ok(log.action.includes("j***@example.com"));
  assert.ok(!log.action.includes("john.doe@example.com"));

  assert.ok(log.details.includes("***-**-6789"));
  assert.ok(!log.details.includes("123-45-6789"));

  assert.ok(log.details.includes("***-***-4567"));
  assert.ok(!log.details.includes("555-123-4567"));
});
