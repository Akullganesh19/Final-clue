import test from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog, generateAuditHash } from './audit';
import { AuditTrail } from '../types';

test('redactPII: masks email', () => {
  assert.strictEqual(redactPII('test john.doe@example.com'), 'test j***@example.com');
});

test('redactPII: masks SSN', () => {
  assert.strictEqual(redactPII('SSN is 123-45-6789 here'), 'SSN is ***-**-**** here');
});

test('redactPII: masks phone', () => {
  assert.strictEqual(redactPII('Call me at 555-123-4567'), 'Call me at ***-***-4567');
  assert.strictEqual(redactPII('Call me at (555) 123-4567'), 'Call me at ***-***-4567');
});

test('redactPII: masks credit card', () => {
  assert.strictEqual(redactPII('Card: 1234-5678-9012-3456'), 'Card: ****-****-****-3456');
});

test('createAuditLog: redacts PII before hashing and returning', () => {
  const originalLogs: AuditTrail[] = [];
  const action = "Viewed user john.doe@example.com";
  const details = "User has SSN 123-45-6789";

  const updatedLogs = createAuditLog(originalLogs, action, details, "Test Author");

  assert.strictEqual(updatedLogs.length, 1);
  const newLog = updatedLogs[0];

  assert.strictEqual(newLog.action, "Viewed user j***@example.com");
  assert.strictEqual(newLog.details, "User has SSN ***-**-****");

  // Verify that the hash in the log matches a hash generated using the redacted values
  const expectedHash = generateAuditHash(
    'CHK-ROOT-GENESIS-CHAIN-STABLE',
    newLog.action,
    newLog.details,
    newLog.author,
    newLog.timestamp
  );

  assert.strictEqual(newLog.hash, expectedHash);
});
