import test from 'node:test';
import assert from 'node:assert';
import { redactPII, createAuditLog } from './audit';

test('redactPII should correctly redact sensitive information', () => {
  assert.strictEqual(redactPII('Contact john.doe@example.com'), 'Contact j***@example.com');
  assert.strictEqual(redactPII('My SSN is 123-45-6789'), 'My SSN is ***-**-6789');
  assert.strictEqual(redactPII('Call me at 555-123-4567'), 'Call me at ***-***-4567');
  assert.strictEqual(redactPII('Call me at +1-555-123-4567'), 'Call me at +***-***-4567');
  assert.strictEqual(redactPII('Card 1234-5678-9012-3456'), 'Card ****-****-****-3456');
});

test('createAuditLog should redact details and author', () => {
  const logs = [];
  const action = 'VIEW_RECORD';
  const details = 'User john.doe@example.com viewed SSN 123-45-6789';
  const author = 'Investigator 555-123-4567';

  const newLogs = createAuditLog(logs, action, details, author);
  const latestLog = newLogs[0];

  assert.strictEqual(latestLog.details, 'User j***@example.com viewed SSN ***-**-6789');
  assert.strictEqual(latestLog.author, 'Investigator ***-***-4567');
});
