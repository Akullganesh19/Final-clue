import { test } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('Sentinel: Audit log should redact PII', () => {
  const baseLogs: AuditTrail[] = [];
  const details = "User john.doe@example.com with SSN 123-45-6789, Phone 555-123-4567, and CC 1234-5678-9012-3456 did something.";
  const logs = createAuditLog(baseLogs, 'action', details, 'author');
  const loggedDetails = logs[0].details;

  assert.ok(!loggedDetails.includes('john.doe@example.com'), 'Email should be redacted');
  assert.ok(!loggedDetails.includes('123-45-6789'), 'SSN should be redacted');
  assert.ok(!loggedDetails.includes('555-123-4567'), 'Phone should be redacted');
  assert.ok(!loggedDetails.includes('1234-5678-9012-3456'), 'CC should be redacted');
  assert.ok(loggedDetails.includes('[REDACTED EMAIL]'), 'Email redaction placeholder missing');
  assert.ok(loggedDetails.includes('[REDACTED SSN]'), 'SSN redaction placeholder missing');
  assert.ok(loggedDetails.includes('[REDACTED PHONE]'), 'Phone redaction placeholder missing');
  assert.ok(loggedDetails.includes('[REDACTED CC]'), 'CC redaction placeholder missing');
});

test('Sentinel: Concurrency attack on audit log creates a fork', () => {
  const baseLogs: AuditTrail[] = [{
    id: '1', timestamp: '2023-01-01', action: 'start', details: 'start', author: 'sys', hash: 'CHK-START'
  }];

  // thread1 reads state and appends
  const thread1Logs = createAuditLog(baseLogs, 'action1', 'details1', 'author1', 'CHK-START');

  // thread2 reads same old state and tries to append. OCC should prevent this fork.
  assert.throws(() => {
    createAuditLog(thread1Logs, 'action2', 'details2', 'author2', 'CHK-WRONG-PARENT');
  }, /Concurrency conflict: Expected previous hash does not match the actual previous hash/);
});
