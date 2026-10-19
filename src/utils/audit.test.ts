import test from 'node:test';
import assert from 'node:assert';
import { ActionPredictor, createAuditLog, globalPredictor } from './audit.js';
import { AuditTrail } from '../types.js';

test('ActionPredictor - train and predictNext', () => {
  const predictor = new ActionPredictor();

  const logs: AuditTrail[] = [
    { id: '1', action: 'LOGIN', details: '', author: '', timestamp: '', hash: '' },
    { id: '2', action: 'VIEW_CASE', details: '', author: '', timestamp: '', hash: '' },
    { id: '3', action: 'EDIT_EVIDENCE', details: '', author: '', timestamp: '', hash: '' },
    { id: '4', action: 'VIEW_CASE', details: '', author: '', timestamp: '', hash: '' },
    { id: '5', action: 'EDIT_EVIDENCE', details: '', author: '', timestamp: '', hash: '' },
    { id: '6', action: 'VIEW_CASE', details: '', author: '', timestamp: '', hash: '' },
    { id: '7', action: 'LOGOUT', details: '', author: '', timestamp: '', hash: '' }
  ];

  predictor.train(logs);

  assert.strictEqual(predictor.predictNext('LOGIN'), 'VIEW_CASE');
  assert.strictEqual(predictor.predictNext('VIEW_CASE'), 'EDIT_EVIDENCE'); // 2 times it went to EDIT_EVIDENCE, 1 time it went to LOGOUT
  assert.strictEqual(predictor.predictNext('EDIT_EVIDENCE'), 'VIEW_CASE');
  assert.strictEqual(predictor.predictNext('LOGOUT'), null);
});

test('ActionPredictor - prefetch gracefully handles errors', () => {
  const predictor = new ActionPredictor();

  // Should not throw
  predictor.prefetch('VIEW_CASE');
  assert.ok(true);
});

test('ActionPredictor - clears state before retraining', () => {
  const predictor = new ActionPredictor();

  const logs1: AuditTrail[] = [
    { id: '1', action: 'A', details: '', author: '', timestamp: '', hash: '' },
    { id: '2', action: 'B', details: '', author: '', timestamp: '', hash: '' }
  ];

  predictor.train(logs1);
  assert.strictEqual(predictor.predictNext('A'), 'B');

  const logs2: AuditTrail[] = [
    { id: '3', action: 'A', details: '', author: '', timestamp: '', hash: '' },
    { id: '4', action: 'C', details: '', author: '', timestamp: '', hash: '' }
  ];

  predictor.train(logs2);
  assert.strictEqual(predictor.predictNext('A'), 'C');
});
