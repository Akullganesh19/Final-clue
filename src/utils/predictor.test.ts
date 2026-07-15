import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NextActionPredictor } from './predictor';
import { AuditTrail } from '../types';

describe('NextActionPredictor', () => {
  const createMockLog = (action: string): AuditTrail => ({
    id: `id-${Math.random()}`,
    timestamp: new Date().toISOString(),
    action,
    details: 'test',
    author: 'tester',
    hash: 'hash'
  });

  it('predicts the most likely next action based on history', () => {
    const logs: AuditTrail[] = [
      createMockLog('SEARCH_CASE'),
      createMockLog('VIEW_CASE'),
      createMockLog('EXTRACT_EVIDENCE'),
      createMockLog('SEARCH_CASE'),
      createMockLog('VIEW_CASE')
    ];

    const predictor = new NextActionPredictor(logs);

    // Most likely after SEARCH_CASE is VIEW_CASE (occurred twice)
    assert.strictEqual(predictor.predict('SEARCH_CASE'), 'VIEW_CASE');

    // Most likely after VIEW_CASE is EXTRACT_EVIDENCE (occurred once)
    assert.strictEqual(predictor.predict('VIEW_CASE'), 'EXTRACT_EVIDENCE');
  });

  it('degrades gracefully and returns null for unknown actions', () => {
    const logs: AuditTrail[] = [
      createMockLog('SEARCH_CASE'),
      createMockLog('VIEW_CASE')
    ];

    const predictor = new NextActionPredictor(logs);

    // Unknown action should return null
    assert.strictEqual(predictor.predict('UNKNOWN_ACTION'), null);
  });
});
