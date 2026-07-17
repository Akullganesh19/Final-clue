import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog, generateAuditHash } from './audit';
import { AuditTrail } from '../types';

test('Sentinel: Delimiter injection vulnerability in hashing', () => {
  const hash1 = generateAuditHash('PREV', 'login', 'admin|success', 'author', 'time');
  const hash2 = generateAuditHash('PREV', 'login|admin', 'success', 'author', 'time');
  assert.notEqual(hash1, hash2, 'Vulnerability: Delimiter injection caused hash collision');
});

test('Sentinel: Missing idempotency allows duplicate records', () => {
  const initialLogs: AuditTrail[] = [];
  const log1 = createAuditLog(initialLogs, 'charge', '100 USD', 'key-1');
  const log2 = createAuditLog(log1, 'charge', '100 USD', 'key-1');
  assert.equal(log2.length, 1, 'Vulnerability: Duplicate actions appended to append-only ledger');
});
