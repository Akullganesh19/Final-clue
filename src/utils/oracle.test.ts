import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { predictNextAction } from './oracle';
import { AuditTrail } from '../types';

describe('Oracle - Next Action Prediction', () => {
  const createLog = (id: string, action: string, author: string): AuditTrail => ({
    id,
    action,
    author,
    timestamp: new Date().toISOString(),
    details: 'test',
    hash: 'test-hash'
  });

  const testLogs: AuditTrail[] = [
    createLog('1', 'VIEW_CASE', 'Alice'),
    createLog('2', 'ADD_NOTE', 'Alice'), // Alice views then adds note
    createLog('3', 'VIEW_CASE', 'Alice'),
    createLog('4', 'ADD_NOTE', 'Alice'), // Alice views then adds note again
    createLog('5', 'VIEW_CASE', 'Alice'),
    createLog('6', 'LINK_EVIDENCE', 'Alice'), // Sometimes she links evidence

    // Different user
    createLog('7', 'VIEW_CASE', 'Bob'),
    createLog('8', 'CLOSE_CASE', 'Bob'),
  ];

  test('predicts next action accurately based on user history', () => {
    // Alice usually adds a note after viewing a case (2 out of 3 times)
    const prediction = predictNextAction(testLogs, 'VIEW_CASE', 'Alice');
    assert.strictEqual(prediction.nextAction, 'ADD_NOTE');
    // 2 'ADD_NOTE' and 1 'LINK_EVIDENCE' out of 3 total 'VIEW_CASE' transitions
    assert.strictEqual(Math.abs(prediction.confidence - (2/3)) < 0.01, true);
  });

  test('degrades gracefully when no subsequent action exists', () => {
    const prediction = predictNextAction(testLogs, 'LINK_EVIDENCE', 'Alice');
    assert.strictEqual(prediction.nextAction, null);
    assert.strictEqual(prediction.confidence, 0);
  });

  test('degrades gracefully when user history is too short', () => {
    const shortLogs = [createLog('1', 'VIEW_CASE', 'Charlie')];
    const prediction = predictNextAction(shortLogs, 'VIEW_CASE', 'Charlie');
    assert.strictEqual(prediction.nextAction, null);
    assert.strictEqual(prediction.confidence, 0);
  });

  test('respects user boundaries (auth/permissions)', () => {
    // Bob has viewed a case but always closes it. He has NEVER added a note.
    const prediction = predictNextAction(testLogs, 'VIEW_CASE', 'Bob');
    assert.strictEqual(prediction.nextAction, 'CLOSE_CASE');
    assert.strictEqual(prediction.confidence, 1.0);
    // Even though Alice adds notes, Bob's prediction should only be based on his history.
    assert.notStrictEqual(prediction.nextAction, 'ADD_NOTE');
  });

  test('returns null if confidence is below threshold', () => {
    const lowConfidenceLogs: AuditTrail[] = [
      createLog('1', 'START', 'Eve'),
      createLog('2', 'A', 'Eve'),
      createLog('3', 'START', 'Eve'),
      createLog('4', 'B', 'Eve'),
      createLog('5', 'START', 'Eve'),
      createLog('6', 'C', 'Eve'),
      createLog('7', 'START', 'Eve'),
      createLog('8', 'D', 'Eve'),
    ];
    // Each action (A,B,C,D) has 25% probability, which is < 30% threshold
    const prediction = predictNextAction(lowConfidenceLogs, 'START', 'Eve');
    assert.strictEqual(prediction.nextAction, null);
    // Confidence returned should be 0.25 but nextAction is null due to threshold
    assert.strictEqual(prediction.confidence, 0.25);
  });
});
