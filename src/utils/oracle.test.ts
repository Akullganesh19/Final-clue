import { test } from 'node:test';
import * as assert from 'node:assert';
import { ActionPredictor } from './oracle';
import { AuditTrail } from '../types';

test('ActionPredictor', async (t) => {
  await t.test('should analyze history and predict next action accurately', () => {
    const predictor = new ActionPredictor();
    const history: AuditTrail[] = [
      { id: '1', action: 'VIEW_CASE', details: '', author: 'Arjun', timestamp: '', hash: '' },
      { id: '2', action: 'VIEW_EVIDENCE', details: '', author: 'Arjun', timestamp: '', hash: '' },
      { id: '3', action: 'VIEW_CASE', details: '', author: 'Arjun', timestamp: '', hash: '' },
      { id: '4', action: 'VIEW_EVIDENCE', details: '', author: 'Arjun', timestamp: '', hash: '' },
      { id: '5', action: 'VIEW_CASE', details: '', author: 'Arjun', timestamp: '', hash: '' },
      { id: '6', action: 'LINK_CASE', details: '', author: 'Arjun', timestamp: '', hash: '' },
    ];

    predictor.analyzeHistory(history);

    // User has all permissions
    const permissions = ['VIEW_EVIDENCE', 'LINK_CASE', 'VIEW_CASE'];

    // VIEW_CASE was followed by VIEW_EVIDENCE twice and LINK_CASE once
    // So for VIEW_CASE, total transitions = 3.
    // VIEW_EVIDENCE probability = 2/3 (0.66)
    // LINK_CASE probability = 1/3 (0.33)
    const predictions = predictor.predictNextActions('VIEW_CASE', permissions);

    assert.strictEqual(predictions.length, 2);
    assert.strictEqual(predictions[0].action, 'VIEW_EVIDENCE');
    assert.ok(predictions[0].probability > 0.66 && predictions[0].probability < 0.67);
    assert.strictEqual(predictions[1].action, 'LINK_CASE');
    assert.ok(predictions[1].probability > 0.33 && predictions[1].probability < 0.34);
  });

  await t.test('should respect user permissions', () => {
    const predictor = new ActionPredictor();
    const history: AuditTrail[] = [
      { id: '1', action: 'VIEW_CASE', details: '', author: 'Arjun', timestamp: '', hash: '' },
      { id: '2', action: 'VIEW_EVIDENCE', details: '', author: 'Arjun', timestamp: '', hash: '' },
      { id: '3', action: 'VIEW_CASE', details: '', author: 'Arjun', timestamp: '', hash: '' },
      { id: '4', action: 'LINK_CASE', details: '', author: 'Arjun', timestamp: '', hash: '' },
    ];

    predictor.analyzeHistory(history);

    // User does not have LINK_CASE permission
    const permissions = ['VIEW_EVIDENCE'];

    // For VIEW_CASE, transition is VIEW_EVIDENCE or LINK_CASE, but user can only VIEW_EVIDENCE
    const predictions = predictor.predictNextActions('VIEW_CASE', permissions);

    assert.strictEqual(predictions.length, 1);
    assert.strictEqual(predictions[0].action, 'VIEW_EVIDENCE');
  });

  await t.test('should degrade gracefully on unseen state', () => {
    const predictor = new ActionPredictor();

    const predictions = predictor.predictNextActions('UNKNOWN_ACTION', ['VIEW_CASE']);

    assert.strictEqual(predictions.length, 0);
  });
});
