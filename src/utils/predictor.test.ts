import test from 'node:test';
import assert from 'node:assert';
import { NextActionPredictor } from './predictor';

test('NextActionPredictor predicts next likely action', () => {
  const predictor = new NextActionPredictor();

  predictor.train('VIEW_CASE');
  predictor.train('ADD_NOTE');

  predictor.train('VIEW_CASE');
  predictor.train('LINK_EVIDENCE');

  predictor.train('VIEW_CASE');
  predictor.train('ADD_NOTE');

  const prediction = predictor.predict('VIEW_CASE');
  assert.strictEqual(prediction, 'ADD_NOTE');
});
