import { test } from 'node:test';
import * as assert from 'node:assert';
import { createAuditLog } from './audit';

test('createAuditLog should redact PII from details', () => {
  const logs = [];
  const result = createAuditLog(logs, 'VIEW_CASE', 'Viewed case for john.doe@gmail.com with phone 123-456-7890', 'Investigator (Arjun Som)');

  assert.equal(result.length, 1);
  assert.equal(result[0].action, 'VIEW_CASE');
  assert.equal(result[0].details.includes('john.doe@gmail.com'), false);
  assert.equal(result[0].details.includes('j***@gmail.com'), true);
  assert.equal(result[0].details.includes('123-456-7890'), false);
  assert.equal(result[0].details.includes('***-***-7890'), true);
});
