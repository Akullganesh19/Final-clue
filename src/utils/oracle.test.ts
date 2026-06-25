import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { OraclePredictor, prefetchPredicted, getPrefetchedCase, clearPredictionCache } from './oracle';
import { Case } from '../types';

describe('Oracle Prediction Engine', () => {
  let mockCases: Case[];
  let baseCase: Case;

  beforeEach(() => {
    clearPredictionCache();

    const createMockCase = (id: string, weapons: string[], vehicles: string[], mo: string[]): Case => ({
      id,
      title: `Case ${id}`,
      date: '2023-01-01',
      location: 'City',
      narrative: '...',
      moDescription: '...',
      moCategories: mo,
      entities: { person: [], vehicle: vehicles, location: [], weapon: weapons },
      status: 'open'
    });

    baseCase = createMockCase('1', ['9mm'], ['Honda'], ['night_entry']);

    mockCases = [
      baseCase,
      // Shared weapon (5 pts) + MO (2 pts) = 7 pts
      createMockCase('2', ['9mm'], ['Toyota'], ['night_entry']),
      // Shared vehicle (4 pts)
      createMockCase('3', ['Knife'], ['Honda'], ['day_entry']),
      // Shared MO (2 pts)
      createMockCase('4', ['Rifle'], ['Ford'], ['night_entry']),
      // No shared elements (0 pts)
      createMockCase('5', ['Poison'], ['Chevy'], ['fraud'])
    ];
  });

  test('OraclePredictor should rank cases correctly based on scoring weights', () => {
    const predicted = OraclePredictor(baseCase, mockCases);

    // Top 3 should be returned, ordered by score
    assert.strictEqual(predicted.length, 3);
    assert.strictEqual(predicted[0].id, '2'); // Highest score (7)
    assert.strictEqual(predicted[1].id, '3'); // Next highest (4)
    assert.strictEqual(predicted[2].id, '4'); // Next highest (2)

    // Case 5 should not be included (score 0)
    assert.ok(!predicted.find(c => c.id === '5'));
  });

  test('prefetchPredicted should cache successfully fetched predicted cases', async () => {
    const fetchMock = async (id: string) => mockCases.find(c => c.id === id) || null;

    await prefetchPredicted(baseCase, mockCases, fetchMock);

    assert.ok(getPrefetchedCase('2'));
    assert.ok(getPrefetchedCase('3'));
    assert.ok(getPrefetchedCase('4'));
    assert.strictEqual(getPrefetchedCase('5'), undefined); // Not predicted, not cached
  });

  test('prefetchPredicted should degrade gracefully if a fetch fails', async () => {
    const fetchMock = async (id: string) => {
      if (id === '3') throw new Error('Permission denied or network failure');
      return mockCases.find(c => c.id === id) || null;
    };

    await prefetchPredicted(baseCase, mockCases, fetchMock);

    assert.ok(getPrefetchedCase('2'));
    assert.strictEqual(getPrefetchedCase('3'), undefined); // Failed gracefully, wasn't cached
    assert.ok(getPrefetchedCase('4'));
  });
});
