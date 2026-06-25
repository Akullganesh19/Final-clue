import test from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('redactPII should correctly redact sensitive information', () => {
  // Email
  assert.strictEqual(redactPII('User j.doe@gmail.com signed in.'), 'User j***@gmail.com signed in.');

  // Credit Card
  assert.strictEqual(redactPII('Card 1234-5678-9012-3456 was charged.'), 'Card ****-****-****-3456 was charged.');
  assert.strictEqual(redactPII('Card 1234 5678 9012 3456 was charged.'), 'Card ****-****-****-3456 was charged.');

  // SSN
  assert.strictEqual(redactPII('SSN is 123-45-6789.'), 'SSN is ***-**-6789.');
  assert.strictEqual(redactPII('SSN is 123 45 6789.'), 'SSN is ***-**-6789.');

  // Phone
  assert.strictEqual(redactPII('Call 555-123-4567.'), 'Call ***-***-4567.');
  assert.strictEqual(redactPII('Call (555) 123-4567.'), 'Call (***-***-4567.');
  assert.strictEqual(redactPII('Call +1-555-123-4567.'), 'Call ***-***-4567.');
});

test('createAuditLog should securely redact logs', () => {
  const initialLogs: AuditTrail[] = [];

  const updatedLogs = createAuditLog(
    initialLogs,
    'Accessed record 123-45-6789',
    'User j.doe@gmail.com viewed the record.',
    'Inv. Smith (555-123-4567)'
  );

  assert.strictEqual(updatedLogs.length, 1);
  const log = updatedLogs[0];

  assert.strictEqual(log.action, 'Accessed record ***-**-6789');
  assert.strictEqual(log.details, 'User j***@gmail.com viewed the record.');
  assert.strictEqual(log.author, 'Inv. Smith (***-***-4567)');
});
