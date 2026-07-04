import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog, generateAuditHash, redactPII } from './audit.js';

test('Audit log redacts PII correctly', () => {
  const details = "User email is test.user@example.com, SSN is 123-45-6789";
  const log = createAuditLog([], 'TEST', details);
  assert.ok(log[0].details.includes('t***@example.com'), 'Email should be redacted');
  assert.ok(log[0].details.includes('***-**-****'), 'SSN should be redacted');
  assert.ok(!log[0].details.includes('123-45-6789'), 'Raw SSN should not be in details');
});

test('Audit log handles null and undefined logs gracefully', () => {
  const logNull = createAuditLog(null, 'TEST', 'Details');
  assert.equal(logNull.length, 1);
  assert.equal(logNull[0].details, 'Details');

  const logUndefined = createAuditLog(undefined, 'TEST', 'Details');
  assert.equal(logUndefined.length, 1);
  assert.equal(logUndefined[0].details, 'Details');
});

test('generateAuditHash does not collide on delimiter injection', () => {
  const prev = "A";
  const act = "B";
  const det = "C";
  const auth = "D";
  const time = "E";

  const normalHash = generateAuditHash(prev, act, det, auth, time);

  // Try to forge by injecting | or other delimiters that used to work
  const forgedHash1 = generateAuditHash(`${prev}|${act}`, "", det, auth, time);
  const forgedHash2 = generateAuditHash(prev, `${act}|${det}`, "", auth, time);

  assert.notEqual(normalHash, forgedHash1, 'Hashes should differ despite string overlap');
  assert.notEqual(normalHash, forgedHash2, 'Hashes should differ despite string overlap');
});

test('PII redaction regex properly handles timestamps vs phone numbers', () => {
  const details = "Do not mask 1234567890123456 or 1709425000 but mask (555) 123-4567 and 555-123-4567";
  const redacted = redactPII(details);

  assert.ok(redacted.includes('1709425000'), 'Timestamp should not be masked');
  assert.ok(redacted.includes('1234567890123456'), 'Plain string of digits should not be masked without separators');
  assert.ok(redacted.includes('[REDACTED PHONE]'), 'Phone number should be masked');
  assert.ok(!redacted.includes('555-123-4567'), 'Raw phone number should not be visible');
});
