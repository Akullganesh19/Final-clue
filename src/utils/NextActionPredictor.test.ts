import test from 'node:test';
import assert from 'node:assert';
import { NextActionPredictor } from './NextActionPredictor.js';

test('NextActionPredictor predicts next action', () => {
  const predictor = new NextActionPredictor();
  assert.strictEqual(predictor.predict(), null);
  predictor.train('VIEW_CASE');
  predictor.train('LINK_CASE');
  predictor.train('VIEW_CASE');
  assert.strictEqual(predictor.predict(), 'LINK_CASE');
});
