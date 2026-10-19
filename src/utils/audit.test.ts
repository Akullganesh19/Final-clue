import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit.ts';

test('createAuditLog redacts phone numbers from details', () => {
  const initialLogs = [];

  // Test case with a standard US phone number
  const newLogs = createAuditLog(
    initialLogs,
    'TEST_ACTION',
    'Contacted witness at (123) 456-7890 for more information.',
    'Test Author'
  );

  const lastLog = newLogs[0];

  assert.strictEqual(
    lastLog.details,
    'Contacted witness at [REDACTED] for more information.',
    'Phone number should be redacted from details'
  );

  // Verify hash matches redacted details, we can't easily check the hash algorithm internals directly
  // but we can ensure the details field itself is redacted, which means it will be passed to generateAuditHash correctly.
});

test('createAuditLog handles different phone number formats', () => {
  const formats = [
    '123-456-7890',
    '123.456.7890',
    '123 456 7890',
    '1234567890',
    '(123)456-7890'
  ];

  for (const format of formats) {
    const logs = createAuditLog([], 'TEST', `Phone: ${format}`, 'Author');
    assert.strictEqual(logs[0].details, 'Phone: [REDACTED]');
  }
});

test('createAuditLog does not redact non-phone numbers', () => {
  const notPhones = [
    'ID: 12345678901', // Too long
    'Amount: $12.34', // Decimals, not phone
    'Year: 2023', // Too short
  ];

  for (const str of notPhones) {
    const logs = createAuditLog([], 'TEST', str, 'Author');
    assert.strictEqual(logs[0].details, str);
  }
});
