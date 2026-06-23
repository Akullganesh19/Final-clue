import test from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog, generateAuditHash } from './audit';

test('redactPII should redact emails correctly', () => {
  const result = redactPII('Contact user at john.doe@example.com for more info.');
  assert.strictEqual(result, 'Contact user at j***@example.com for more info.');
});

test('redactPII should redact SSNs correctly', () => {
  const result = redactPII('User SSN is 123-45-6789 in the system.');
  assert.strictEqual(result, 'User SSN is ***-**-**** in the system.');
});

test('redactPII should redact phone numbers correctly', () => {
  const result = redactPII('Call (555) 123-4567 or +1-800-555-1234.');
  assert.strictEqual(result, 'Call ***-***-**** or ***-***-****.');
});

test('redactPII should redact credit cards correctly', () => {
  const result = redactPII('Charged card 4111 1111 1111 1111 today.');
  assert.strictEqual(result, 'Charged card ****-****-****-**** today.');
});

test('createAuditLog should securely redact PII from details', () => {
  const logs = [];
  const action = 'VIEW_CASE';
  const details = 'Viewed case involving email alice@test.com and phone 555-987-6543.';

  const updatedLogs = createAuditLog(logs, action, details, 'Admin');

  assert.strictEqual(updatedLogs.length, 1);
  assert.strictEqual(updatedLogs[0].details, 'Viewed case involving email a***@test.com and phone ***-***-****.');

  // Hash must not be calculated from the original unredacted details
  const generatedHash = updatedLogs[0].hash;
  const hashFromRedacted = generateAuditHash('CHK-ROOT-GENESIS-CHAIN-STABLE', action, 'Viewed case involving email a***@test.com and phone ***-***-****.', 'Admin', updatedLogs[0].timestamp);

  assert.strictEqual(generatedHash, hashFromRedacted);
});
