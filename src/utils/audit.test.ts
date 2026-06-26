import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createAuditLog } from './audit';
import { AuditTrail } from '../types';

describe('Sentinel: Adversarial Verification of Audit Logger', () => {
  it('🔴 Exploitable: allows concurrent read-modify-write resulting in lost logs (Missing OCC)', () => {
    const initialLogs: AuditTrail[] = [];

    // Setup initial state
    const state0 = createAuditLog(initialLogs, 'INIT', 'System start');

    // User A and User B fetch state at same time
    const userA_State = [...state0];
    const userB_State = [...state0];

    // User A acts
    const stateA = createAuditLog(userA_State, 'ACTION_A', 'Did A');

    // User B acts (concurrently)
    assert.throws(() => {
        createAuditLog(userB_State, 'ACTION_B', 'Did B', undefined, stateA[stateA.length - 1].hash);
    }, /OCC failure/i, 'Should throw error when expected hash does not match previous hash');
  });

  it('🔴 Exploitable: writes PII (SSN, Email, CC, Phone) in plaintext into the audit log', () => {
    const state = createAuditLog(
      [],
      'USER_UPDATE',
      'Updated user profile. Email: jdoe@gmail.com, SSN: 123-45-6789, Phone: (555) 123-4567, Card: 4111-2222-3333-4444'
    );

    // PII should be redacted
    assert.strictEqual(
      state[0].details.includes('jdoe@gmail.com'),
      false,
      "Email should not be leaked"
    );
    assert.strictEqual(
      state[0].details.includes('j***@gmail.com'),
      true,
      "Email should be redacted"
    );
    assert.strictEqual(
      state[0].details.includes('123-45-6789'),
      false,
      "SSN should not be leaked"
    );
    assert.strictEqual(
      state[0].details.includes('***-***-6789'),
      true,
      "SSN should be redacted"
    );
    assert.strictEqual(
      state[0].details.includes('(555) 123-4567'),
      false,
      "Phone should not be leaked"
    );
    assert.strictEqual(
      state[0].details.includes('***-***-4567'),
      true,
      "Phone should be redacted"
    );
    assert.strictEqual(
      state[0].details.includes('4111-2222-3333-4444'),
      false,
      "Card should not be leaked"
    );
    assert.strictEqual(
      state[0].details.includes('****-****-****-4444'),
      true,
      "Card should be redacted"
    );
  });
});
