import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { NextActionPredictor } from './predictor';

describe('NextActionPredictor', () => {
  it('predicts the most likely next action based on training sequence', () => {
    const predictor = new NextActionPredictor();

    // Train with sequence: VIEW_CASE -> LINK_EVIDENCE -> VIEW_CASE -> LINK_EVIDENCE -> VIEW_CASE -> CLOSE_CASE
    predictor.train('VIEW_CASE');
    predictor.train('LINK_EVIDENCE');
    predictor.train('VIEW_CASE');
    predictor.train('LINK_EVIDENCE');
    predictor.train('VIEW_CASE');
    predictor.train('CLOSE_CASE');

    // Expected: VIEW_CASE most likely leads to LINK_EVIDENCE (2 times vs CLOSE_CASE 1 time)
    const prediction = predictor.predict('VIEW_CASE');
    assert.strictEqual(prediction, 'LINK_EVIDENCE');
  });

  it('returns null if no transitions exist for an action', () => {
    const predictor = new NextActionPredictor();
    predictor.train('ONLY_ACTION');

    const prediction = predictor.predict('UNKNOWN_ACTION');
    assert.strictEqual(prediction, null);
  });
});
