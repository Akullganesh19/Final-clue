import test from 'node:test';
import assert from 'node:assert';
import { ActionPredictor } from './ActionPredictor';
import { AuditTrail } from '../types';

test('ActionPredictor tests', async (t) => {
  await t.test('predicts the most frequent next action', () => {
    const predictor = new ActionPredictor();
    const mockLogs: AuditTrail[] = [
      { id: '1', timestamp: 'ts', action: 'login', details: '', author: '', hash: '' },
      { id: '2', timestamp: 'ts', action: 'view_case', details: '', author: '', hash: '' },
      { id: '3', timestamp: 'ts', action: 'add_evidence', details: '', author: '', hash: '' },
      { id: '4', timestamp: 'ts', action: 'login', details: '', author: '', hash: '' },
      { id: '5', timestamp: 'ts', action: 'view_case', details: '', author: '', hash: '' },
      { id: '6', timestamp: 'ts', action: 'add_evidence', details: '', author: '', hash: '' },
      { id: '7', timestamp: 'ts', action: 'view_case', details: '', author: '', hash: '' },
      { id: '8', timestamp: 'ts', action: 'read_notes', details: '', author: '', hash: '' },
    ];

    predictor.train(mockLogs);

    // 'view_case' transitions to 'add_evidence' twice, and to 'read_notes' once.
    const prediction = predictor.predictNext('view_case');
    assert.strictEqual(prediction, 'add_evidence');
  });

  await t.test('degrades gracefully with unseen actions', () => {
    const predictor = new ActionPredictor();
    const mockLogs: AuditTrail[] = [
      { id: '1', timestamp: 'ts', action: 'login', details: '', author: '', hash: '' },
      { id: '2', timestamp: 'ts', action: 'view_case', details: '', author: '', hash: '' },
    ];

    predictor.train(mockLogs);

    // An action it has never seen
    const prediction1 = predictor.predictNext('unknown_action');
    assert.strictEqual(prediction1, null);

    // An action it has seen, but only at the end (so no transitions from it)
    const prediction2 = predictor.predictNext('view_case');
    assert.strictEqual(prediction2, null);
  });
});
