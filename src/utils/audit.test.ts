import { test } from 'node:test';
import * as assert from 'node:assert';
import { redactPII, createAuditLog } from './audit';

test('redactPII should mask emails', () => {
  assert.strictEqual(redactPII('User jsmith@gmail.com bought an item'), 'User j***@gmail.com bought an item');
  assert.strictEqual(redactPII('Contact us at info@example.com'), 'Contact us at i***@example.com');
});

test('redactPII should mask SSNs', () => {
  assert.strictEqual(redactPII('SSN is 123-45-6789'), 'SSN is ***-**-6789');
  assert.strictEqual(redactPII('SSN: 123 45 6789'), 'SSN: ***-**-6789');
});

test('redactPII should mask Credit Cards', () => {
  assert.strictEqual(redactPII('Card: 1234-5678-9012-3456'), 'Card: ****-****-****-3456');
  assert.strictEqual(redactPII('Card: 1234 5678 9012 3456'), 'Card: ****-****-****-3456');
});

test('redactPII should mask Phone Numbers', () => {
  assert.strictEqual(redactPII('Phone: 123-456-7890'), 'Phone: ***-***-7890');
  assert.strictEqual(redactPII('Phone: (123) 456-7890'), 'Phone: ***-***-7890');
  assert.strictEqual(redactPII('Phone: +1 123-456-7890'), 'Phone: ***-***-7890');
});

test('redactPII should not mask Snowflake IDs', () => {
  assert.strictEqual(redactPII('ID: 1675200000000000'), 'ID: 1675200000000000');
});

test('createAuditLog should redact details before storing and hashing', async () => {
  const logs = [];
  const newLogs = createAuditLog(logs, 'CREATE_USER', 'Created user with email user123@test.com and SSN 987-65-4321');

  assert.strictEqual(newLogs.length, 1);
  assert.strictEqual(
    newLogs[0].details,
    'Created user with email u***@test.com and SSN ***-**-4321'
  );

  // Verify that the details were passed redacted into the hash generation logic by recreating it
  const { generateAuditHash } = await import('./audit');
  const expectedHash = generateAuditHash(
    'CHK-ROOT-GENESIS-CHAIN-STABLE',
    'CREATE_USER',
    'Created user with email u***@test.com and SSN ***-**-4321',
    'Investigator (Arjun Som)',
    newLogs[0].timestamp
  );
  assert.strictEqual(newLogs[0].hash, expectedHash);
});
