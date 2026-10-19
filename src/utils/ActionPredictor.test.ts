import test, { mock } from 'node:test';
import assert from 'node:assert';
import { ActionPredictor } from './ActionPredictor.ts';
import { AuditTrail } from '../types.ts';

test('ActionPredictor - train and predictNext', () => {
  const predictor = new ActionPredictor();

  const logs: AuditTrail[] = [
    { id: '1', action: 'LOGIN', details: '', author: '', timestamp: '', hash: '' },
    { id: '2', action: 'VIEW_CASE', details: '', author: '', timestamp: '', hash: '' },
    { id: '3', action: 'VIEW_EVIDENCE', details: '', author: '', timestamp: '', hash: '' },
    { id: '4', action: 'LOGIN', details: '', author: '', timestamp: '', hash: '' },
    { id: '5', action: 'VIEW_CASE', details: '', author: '', timestamp: '', hash: '' },
    { id: '6', action: 'VIEW_LINKAGE', details: '', author: '', timestamp: '', hash: '' },
    { id: '7', action: 'LOGIN', details: '', author: '', timestamp: '', hash: '' },
    { id: '8', action: 'VIEW_CASE', details: '', author: '', timestamp: '', hash: '' },
  ];

  predictor.train(logs);

  // VIEW_CASE follows LOGIN 3 times
  assert.strictEqual(predictor.predictNext('LOGIN'), 'VIEW_CASE');

  // VIEW_EVIDENCE follows VIEW_CASE once, VIEW_LINKAGE follows VIEW_CASE once, LOGIN follows VIEW_CASE once, but the highest frequency next action depends on transition map.
  // We can just assert that predictNext is working as expected
  const nextAfterViewCase = predictor.predictNext('VIEW_CASE');
  assert.ok(nextAfterViewCase === 'VIEW_EVIDENCE' || nextAfterViewCase === 'VIEW_LINKAGE' || nextAfterViewCase === 'LOGIN');

  // Nothing follows VIEW_LINKAGE in the sequence except LOGIN (1 time)
  assert.strictEqual(predictor.predictNext('VIEW_LINKAGE'), 'LOGIN');
});

test('ActionPredictor - clears internal state before training', () => {
  const predictor = new ActionPredictor();

  const logs1: AuditTrail[] = [
    { id: '1', action: 'A', details: '', author: '', timestamp: '', hash: '' },
    { id: '2', action: 'B', details: '', author: '', timestamp: '', hash: '' },
  ];

  predictor.train(logs1);
  assert.strictEqual(predictor.predictNext('A'), 'B');

  const logs2: AuditTrail[] = [
    { id: '3', action: 'A', details: '', author: '', timestamp: '', hash: '' },
    { id: '4', action: 'C', details: '', author: '', timestamp: '', hash: '' },
    { id: '5', action: 'A', details: '', author: '', timestamp: '', hash: '' },
    { id: '6', action: 'C', details: '', author: '', timestamp: '', hash: '' },
  ];

  predictor.train(logs2);
  // It should forget 'B' and only know 'C' follows 'A'
  assert.strictEqual(predictor.predictNext('A'), 'C');
});

test('ActionPredictor - prefetchNext with TTL cache', async () => {
  // Mock window to simulate browser environment
  (globalThis as any).window = {};

  let fetchCallCount = 0;
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    fetchCallCount++;
    return new Response('{}');
  }) as any;

  const predictor = new ActionPredictor();
  const logs: AuditTrail[] = [
    { id: '1', action: 'LOGIN', details: '', author: '', timestamp: '', hash: '' },
    { id: '2', action: 'VIEW_CASE', details: '', author: '', timestamp: '', hash: '' },
  ];
  predictor.train(logs);

  mock.timers.enable({ apis: ['setTimeout'] });

  try {
    // First prefetch
    predictor.prefetchNext('LOGIN');
    assert.strictEqual(fetchCallCount, 1);

    // Immediate second prefetch should be cached (skipped)
    predictor.prefetchNext('LOGIN');
    assert.strictEqual(fetchCallCount, 1);

    // Advance time by 11 seconds
    mock.timers.tick(11000);

    // Third prefetch should trigger a new fetch since TTL expired
    predictor.prefetchNext('LOGIN');
    assert.strictEqual(fetchCallCount, 2);
  } finally {
    mock.timers.reset();
    delete (globalThis as any).window;
  }
});
