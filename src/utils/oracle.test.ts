import { test } from 'node:test';
import * as assert from 'node:assert';
import { predictNextCases } from './oracle';
import { Linkage, Case } from '../types';

test('predictNextCases: should predict top 3 highest confidence adjacent cases', () => {
  const caseA = { id: 'caseA' } as Case;
  const caseB = { id: 'caseB' } as Case;
  const caseC = { id: 'caseC' } as Case;
  const caseD = { id: 'caseD' } as Case;
  const caseE = { id: 'caseE' } as Case;

  const linkages: Linkage[] = [
    { caseA, caseB, confidence: 90, criticFlags: [], investigatorStatus: 'pending' } as unknown as Linkage,
    { caseA, caseB: caseC, confidence: 80, criticFlags: [], investigatorStatus: 'pending' } as unknown as Linkage,
    { caseA, caseB: caseD, confidence: 95, criticFlags: [], investigatorStatus: 'pending' } as unknown as Linkage,
    { caseA, caseB: caseE, confidence: 70, criticFlags: [], investigatorStatus: 'pending' } as unknown as Linkage,
  ];

  const predicted = predictNextCases('caseA', linkages);

  // Should return D (95), B (90), C (80)
  assert.strictEqual(predicted.length, 3);
  assert.strictEqual(predicted[0].id, 'caseD');
  assert.strictEqual(predicted[1].id, 'caseB');
  assert.strictEqual(predicted[2].id, 'caseC');
});

test('predictNextCases: should ignore rejected linkages', () => {
  const caseA = { id: 'caseA' } as Case;
  const caseB = { id: 'caseB' } as Case;
  const caseC = { id: 'caseC' } as Case;

  const linkages: Linkage[] = [
    { caseA, caseB, confidence: 99, criticFlags: [], investigatorStatus: 'rejected' } as unknown as Linkage,
    { caseA, caseB: caseC, confidence: 80, criticFlags: [], investigatorStatus: 'pending' } as unknown as Linkage,
  ];

  const predicted = predictNextCases('caseA', linkages);

  assert.strictEqual(predicted.length, 1);
  assert.strictEqual(predicted[0].id, 'caseC'); // caseB is rejected
});

test('predictNextCases: should ignore linkages with conflict flags', () => {
  const caseA = { id: 'caseA' } as Case;
  const caseB = { id: 'caseB' } as Case;
  const caseC = { id: 'caseC' } as Case;

  const linkages: Linkage[] = [
    { caseA, caseB, confidence: 99, criticFlags: [{ type: 'conflict', message: 'alibi' }], investigatorStatus: 'pending' } as unknown as Linkage,
    { caseA, caseB: caseC, confidence: 80, criticFlags: [{ type: 'warning', message: 'time diff' }], investigatorStatus: 'pending' } as unknown as Linkage,
  ];

  const predicted = predictNextCases('caseA', linkages);

  assert.strictEqual(predicted.length, 1);
  assert.strictEqual(predicted[0].id, 'caseC'); // caseB has a conflict
});

test('predictNextCases: degrades gracefully if no data or no matches', () => {
  assert.strictEqual(predictNextCases('caseA', []).length, 0);
  assert.strictEqual(predictNextCases('', []).length, 0);

  const caseA = { id: 'caseA' } as Case;
  const caseB = { id: 'caseB' } as Case;
  const linkages: Linkage[] = [
    { caseA, caseB, confidence: 99, criticFlags: [], investigatorStatus: 'pending' } as unknown as Linkage,
  ];
  // No linkages for caseC
  assert.strictEqual(predictNextCases('caseC', linkages).length, 0);
});
