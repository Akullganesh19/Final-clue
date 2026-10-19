import test from 'node:test';
import assert from 'node:assert';
import { ActionPredictor, actionPredictor } from './ActionPredictor';

test('ActionPredictor predicts next likely action', (t) => {
  const predictor = new ActionPredictor();

  // Initially, no predictions
  assert.strictEqual(predictor.predictNextAction('view_case'), null);

  // Train the predictor
  predictor.trackAction('view_case');
  predictor.trackAction('review_evidence');

  predictor.trackAction('view_case');
  predictor.trackAction('review_evidence');

  predictor.trackAction('view_case');
  predictor.trackAction('close_case'); // Less frequent

  // Prediction should favor 'review_evidence'
  assert.strictEqual(predictor.predictNextAction('view_case'), 'review_evidence');

  // Verify transition matrix
  const matrix = predictor.getTransitionMatrix();
  assert.strictEqual(matrix['view_case']['review_evidence'], 2);
  assert.strictEqual(matrix['view_case']['close_case'], 1);
});

test('Singleton predictor works', (t) => {
  actionPredictor.reset();
  actionPredictor.trackAction('login');
  actionPredictor.trackAction('dashboard');

  assert.strictEqual(actionPredictor.predictNextAction('login'), 'dashboard');
});
