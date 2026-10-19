import test from 'node:test';
import assert from 'node:assert';
import { createAuditLog, verifyAuditChain } from './audit';
import { AuditTrail } from '../types';

test('verifyAuditChain validates correct chains', () => {
  const initialLogs: AuditTrail[] = [];
  const logs1 = createAuditLog(initialLogs, 'TEST_ACTION_1', 'Details 1', 'Author');
  const logs2 = createAuditLog(logs1, 'TEST_ACTION_2', 'Details 2', 'Author');

  const result = verifyAuditChain(logs2);
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.corruptedIndex, undefined);
});

test('verifyAuditChain detects tampering', () => {
  const initialLogs: AuditTrail[] = [];
  const logs1 = createAuditLog(initialLogs, 'TEST_ACTION_1', 'Details 1', 'Author');
  const logs2 = createAuditLog(logs1, 'TEST_ACTION_2', 'Details 2', 'Author');
  const logs3 = createAuditLog(logs2, 'TEST_ACTION_3', 'Details 3', 'Author');

  const corruptedLogs = [...logs3];
  corruptedLogs[1] = {
    ...corruptedLogs[1],
    details: 'Tampered details'
  };

  const result = verifyAuditChain(corruptedLogs);
  assert.strictEqual(result.isValid, false);
  assert.strictEqual(result.corruptedIndex, 1);
});
