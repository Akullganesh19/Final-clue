import test from 'node:test';
import assert from 'node:assert';
import { findCaseClusters } from './clustering.js';
import { Case, Linkage } from '../types.js';

const mockCase = (id: string, moCategories: string[] = []): Case => ({
  id,
  title: `Case ${id}`,
  date: '2023-01-01',
  location: 'City',
  narrative: '...',
  moDescription: '...',
  moCategories,
  entities: { person: [], vehicle: [], location: [], weapon: [] },
  status: 'cold'
});

const mockLinkage = (id: string, caseA: Case, caseB: Case): Linkage => ({
  id,
  caseA,
  caseB,
  confidence: 80,
  signals: { semantic: 0.8, entity: 0.8, temporal: 0.8, mo: 0.8 },
  evidence: [],
  criticFlags: [],
  summary: '...',
  investigatorStatus: 'confirmed'
});

test('findCaseClusters - handles empty inputs', () => {
  assert.deepStrictEqual(findCaseClusters([], []), []);
});

test('findCaseClusters - groups simple connected component', () => {
  const c1 = mockCase('1', ['Nighttime', 'Home Invasion']);
  const c2 = mockCase('2', ['Nighttime', 'Home Invasion']);
  const c3 = mockCase('3', ['Nighttime', 'Street']);

  const cases = [c1, c2, c3];
  const linkages = [
    mockLinkage('L1', c1, c2),
    mockLinkage('L2', c2, c3)
  ];

  const clusters = findCaseClusters(cases, linkages);
  assert.strictEqual(clusters.length, 1);
  assert.strictEqual(clusters[0].cases.length, 3);
  assert.strictEqual(clusters[0].linkages.length, 2);
  assert.ok(clusters[0].commonMoCategories.includes('Nighttime'));
  assert.ok(clusters[0].commonMoCategories.includes('Home Invasion'));
});

test('findCaseClusters - logic for common MO categories', () => {
  const c1 = mockCase('1', ['A', 'B']);
  const c2 = mockCase('2', ['A', 'B']);
  const c3 = mockCase('3', ['A', 'C']);

  const cases = [c1, c2, c3];
  const linkages = [mockLinkage('L1', c1, c2), mockLinkage('L2', c2, c3)];
  const clusters = findCaseClusters(cases, linkages);

  assert.strictEqual(clusters.length, 1);
  // 'A' is in 3/3 (> 1.5), 'B' is in 2/3 (> 1.5), 'C' is in 1/3 (< 1.5)
  assert.ok(clusters[0].commonMoCategories.includes('A'));
  assert.ok(clusters[0].commonMoCategories.includes('B'));
  assert.ok(!clusters[0].commonMoCategories.includes('C'));
});

test('findCaseClusters - multiple disconnected components', () => {
  const c1 = mockCase('1');
  const c2 = mockCase('2');
  const c3 = mockCase('3');
  const c4 = mockCase('4');

  const cases = [c1, c2, c3, c4];
  const linkages = [
    mockLinkage('L1', c1, c2),
    mockLinkage('L2', c3, c4)
  ];

  const clusters = findCaseClusters(cases, linkages);
  assert.strictEqual(clusters.length, 2);
  assert.strictEqual(clusters[0].cases.length, 2);
  assert.strictEqual(clusters[1].cases.length, 2);
});

test('findCaseClusters - isolated cases are ignored', () => {
  const c1 = mockCase('1');
  const c2 = mockCase('2');
  const c3 = mockCase('3'); // Isolated

  const cases = [c1, c2, c3];
  const linkages = [mockLinkage('L1', c1, c2)];

  const clusters = findCaseClusters(cases, linkages);
  assert.strictEqual(clusters.length, 1);
  assert.strictEqual(clusters[0].cases.length, 2);
});
