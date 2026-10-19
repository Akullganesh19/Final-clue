import { test } from 'node:test';
import * as assert from 'node:assert';
import { ActionPredictor } from './oracle';
import { AuditTrail } from '../types';

test('ActionPredictor predicts the next likely action based on training data', async () => {
  const predictor = ActionPredictor.getInstance();

  const logs: AuditTrail[] = [
    { id: '1', timestamp: '2023-01-01T00:00:00.000Z', action: 'LOGIN', details: '', author: 'UserA', hash: 'H1' },
    { id: '2', timestamp: '2023-01-01T00:01:00.000Z', action: 'VIEW_DASHBOARD', details: '', author: 'UserA', hash: 'H2' },
    { id: '3', timestamp: '2023-01-01T00:02:00.000Z', action: 'VIEW_CASE_LIST', details: '', author: 'UserA', hash: 'H3' },
    { id: '4', timestamp: '2023-01-01T00:03:00.000Z', action: 'LOGIN', details: '', author: 'UserA', hash: 'H4' },
    { id: '5', timestamp: '2023-01-01T00:04:00.000Z', action: 'VIEW_DASHBOARD', details: '', author: 'UserA', hash: 'H5' }
  ];

  predictor.train(logs);

  const nextAfterLogin = predictor.predictNextAction('LOGIN');
  assert.strictEqual(nextAfterLogin, 'VIEW_DASHBOARD');

  const nextAfterDashboard = predictor.predictNextAction('VIEW_DASHBOARD');
  assert.strictEqual(nextAfterDashboard, 'VIEW_CASE_LIST');

  const nextAfterUnknown = predictor.predictNextAction('UNKNOWN_ACTION');
  assert.strictEqual(nextAfterUnknown, null);
});

test('ActionPredictor prefetching does not throw errors', async () => {
  const predictor = ActionPredictor.getInstance();

  // This should not throw, just log to console or quietly fail depending on environment
  await assert.doesNotReject(async () => {
    await predictor.prefetchPredictedAction('LOGIN');
  });
});
