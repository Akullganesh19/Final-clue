import { test } from 'node:test';
import * as assert from 'node:assert';
import { ActionPredictor } from './oracle';
import { AuditTrail } from '../types';

test('ActionPredictor - should correctly build markov chain and predict next action', () => {
  const predictor = new ActionPredictor();

  const history: AuditTrail[] = [
    { id: '1', action: 'LOGIN', timestamp: '', details: '', author: '', hash: '' },
    { id: '2', action: 'VIEW_CASE_LIST', timestamp: '', details: '', author: '', hash: '' },
    { id: '3', action: 'VIEW_EVIDENCE_LIST', timestamp: '', details: '', author: '', hash: '' },
    { id: '4', action: 'VIEW_CASE_LIST', timestamp: '', details: '', author: '', hash: '' },
    { id: '5', action: 'VIEW_EVIDENCE_LIST', timestamp: '', details: '', author: '', hash: '' },
    { id: '6', action: 'LOGIN', timestamp: '', details: '', author: '', hash: '' },
    { id: '7', action: 'VIEW_CASE_LIST', timestamp: '', details: '', author: '', hash: '' },
    { id: '8', action: 'SEARCH_CASES', timestamp: '', details: '', author: '', hash: '' },
  ];

  predictor.train(history);

  // VIEW_CASE_LIST is followed by VIEW_EVIDENCE_LIST twice, and SEARCH_CASES once.
  // Predictor should guess VIEW_EVIDENCE_LIST
  const prediction = predictor.predictNext('VIEW_CASE_LIST');
  assert.strictEqual(prediction, 'VIEW_EVIDENCE_LIST');
});

test('ActionPredictor - should clear state before retraining to avoid quadratic counts', () => {
  const predictor = new ActionPredictor();

  const history1: AuditTrail[] = [
    { id: '1', action: 'A', timestamp: '', details: '', author: '', hash: '' },
    { id: '2', action: 'B', timestamp: '', details: '', author: '', hash: '' },
    { id: '3', action: 'A', timestamp: '', details: '', author: '', hash: '' },
    { id: '4', action: 'B', timestamp: '', details: '', author: '', hash: '' },
  ];

  predictor.train(history1);

  const history2: AuditTrail[] = [
    { id: '1', action: 'A', timestamp: '', details: '', author: '', hash: '' },
    { id: '2', action: 'C', timestamp: '', details: '', author: '', hash: '' },
    { id: '3', action: 'A', timestamp: '', details: '', author: '', hash: '' },
    { id: '4', action: 'C', timestamp: '', details: '', author: '', hash: '' },
    { id: '5', action: 'A', timestamp: '', details: '', author: '', hash: '' },
    { id: '6', action: 'C', timestamp: '', details: '', author: '', hash: '' },
  ];

  predictor.train(history2);

  // If state was not cleared, B might still be predicted or have counts if history1 was longer.
  // Since we trained with history2, C should be predicted for A. B shouldn't be the top.
  const prediction = predictor.predictNext('A');
  assert.strictEqual(prediction, 'C');

  // Also B should not be a key in A's transitions if cleared.
  // Actually A -> B will not exist in the new markov chain.
  const predictionB = predictor.predictNext('B');
  assert.strictEqual(predictionB, null);
});
