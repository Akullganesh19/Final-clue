import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog, redactPII, generateAuditHash } from './audit';

test('redactPII correctly masks PII data', () => {
  assert.strictEqual(redactPII('john.doe@gmail.com'), 'j***@gmail.com');
  assert.strictEqual(redactPII('Credit card is 1234-5678-9012-3456'), 'Credit card is ****-****-****-3456');
  assert.strictEqual(redactPII('Credit card is 1234 5678 9012 3456'), 'Credit card is ****-****-****-3456');
  assert.strictEqual(redactPII('SSN: 123-45-6789'), 'SSN: ***-**-6789');
  assert.strictEqual(redactPII('Phone: 555-123-4567'), 'Phone: ***-***-4567');
  assert.strictEqual(redactPII('Phone: (555) 123-4567'), 'Phone: ***-***-4567');
  assert.strictEqual(redactPII('Phone: +1 555-123-4567'), 'Phone: ***-***-4567');
});

test('createAuditLog properly redacts sensitive data before appending', () => {
  const logs = [];
  const nextLogs = createAuditLog(
    logs,
    'Login from john.doe@gmail.com',
    'User john.doe@gmail.com logged in with phone 555-123-4567 and ssn 123-45-6789',
    'Arjun Som'
  );

  assert.strictEqual(
    nextLogs[0].action,
    'Login from j***@gmail.com'
  );

  assert.strictEqual(
    nextLogs[0].details,
    'User j***@gmail.com logged in with phone ***-***-4567 and ssn ***-**-6789'
  );
});
