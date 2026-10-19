import { test } from 'node:test';
import assert from 'node:assert';
import { generateAuditHash, generateAuditHashV2, validateAuditLog, createAuditLog } from './audit';
import { AuditTrail } from '../types';

test('Audit Hash Validation', async (t) => {
  await t.test('V1 is vulnerable to delimiter injection', () => {
    const hash1 = generateAuditHash('PREV', 'LOGIN', 'SUCCESS|User', 'Arjun', '2023-01-01');
    const hash2 = generateAuditHash('PREV', 'LOGIN|SUCCESS', 'User', 'Arjun', '2023-01-01');
    assert.strictEqual(hash1, hash2, 'V1 should produce identical hashes for delimiter injection');
  });

  await t.test('V2 is protected against delimiter injection', () => {
    const hashV2_1 = generateAuditHashV2('PREV', 'LOGIN', 'SUCCESS|User', 'Arjun', '2023-01-01');
    const hashV2_2 = generateAuditHashV2('PREV', 'LOGIN|SUCCESS', 'User', 'Arjun', '2023-01-01');
    assert.notStrictEqual(hashV2_1, hashV2_2, 'V2 should produce distinct hashes for delimiter injection');
  });

  await t.test('validateAuditLog supports V1 logs', () => {
    const v1Log: AuditTrail = {
      id: 'test',
      timestamp: '2023-01-01',
      action: 'LOGIN',
      details: 'SUCCESS',
      author: 'Arjun',
      hash: generateAuditHash('PREV', 'LOGIN', 'SUCCESS', 'Arjun', '2023-01-01'),
    };
    assert.ok(validateAuditLog(v1Log, 'PREV'), 'Should validate correct V1 log');
    assert.ok(!validateAuditLog(v1Log, 'WRONG'), 'Should reject invalid V1 log');
  });

  await t.test('validateAuditLog supports V2 logs', () => {
    const v2Log: AuditTrail = {
      id: 'test',
      timestamp: '2023-01-01',
      action: 'LOGIN',
      details: 'SUCCESS',
      author: 'Arjun',
      hash: generateAuditHashV2('PREV', 'LOGIN', 'SUCCESS', 'Arjun', '2023-01-01'),
      hashVersion: 2,
    };
    assert.ok(validateAuditLog(v2Log, 'PREV'), 'Should validate correct V2 log');
    assert.ok(!validateAuditLog(v2Log, 'WRONG'), 'Should reject invalid V2 log');
  });
});
