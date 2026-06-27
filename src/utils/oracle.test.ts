import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { predictAndPrefetchCases, getCaseWithPrediction, clearOracleCache } from './oracle.js';
import { Case, Linkage } from '../types';

describe('Oracle Prediction Engine', () => {
  beforeEach(() => {
    clearOracleCache();
  });

  const mockCaseA: Case = {
    id: 'c1',
    title: 'Case 1',
    date: '2020-01-01',
    location: 'NY',
    narrative: '',
    moDescription: '',
    moCategories: [],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'cold'
  };

  const mockCaseB: Case = {
    id: 'c2',
    title: 'Case 2',
    date: '2020-01-02',
    location: 'NY',
    narrative: '',
    moDescription: '',
    moCategories: [],
    entities: { person: [], vehicle: [], location: [], weapon: [] },
    status: 'cold'
  };

  const mockLinkage: Linkage = {
    id: 'l1',
    caseA: mockCaseA,
    caseB: mockCaseB,
    confidence: 85,
    signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
    evidence: [],
    criticFlags: [],
    summary: '',
    investigatorStatus: 'pending'
  };

  it('should prefetch and cache cases for high-confidence pending linkages', async () => {
    let fetchCount = 0;
    const mockFetchCase = async (id: string) => {
      fetchCount++;
      return id === 'c1' ? mockCaseA : mockCaseB;
    };

    // Trigger prediction
    predictAndPrefetchCases([mockLinkage], mockFetchCase);

    // Allow promises to resolve
    await new Promise(resolve => setTimeout(resolve, 10));

    assert.strictEqual(fetchCount, 2);

    // Retrieve should not trigger new fetches
    let demandFetchCount = 0;
    const mockDemandFetchCase = async (id: string) => {
      demandFetchCount++;
      return id === 'c1' ? mockCaseA : mockCaseB;
    };

    const c1 = await getCaseWithPrediction('c1', mockDemandFetchCase);
    const c2 = await getCaseWithPrediction('c2', mockDemandFetchCase);

    assert.strictEqual(demandFetchCount, 0); // Both came from cache
    assert.strictEqual(c1.id, 'c1');
    assert.strictEqual(c2.id, 'c2');
  });

  it('should degrade gracefully on fetch failure', async () => {
    let fetchCount = 0;
    const mockFailingFetchCase = async (id: string) => {
      fetchCount++;
      throw new Error('Network error');
    };

    // Should not throw, should handle error silently
    predictAndPrefetchCases([mockLinkage], mockFailingFetchCase);

    await new Promise(resolve => setTimeout(resolve, 10));

    assert.strictEqual(fetchCount, 2);

    // Later when actually requested, should attempt normal fetch
    let demandFetchCount = 0;
    const mockDemandFetchCase = async (id: string) => {
      demandFetchCount++;
      return id === 'c1' ? mockCaseA : mockCaseB;
    };

    const c1 = await getCaseWithPrediction('c1', mockDemandFetchCase);

    assert.strictEqual(demandFetchCount, 1);
    assert.strictEqual(c1.id, 'c1');
  });

  it('should ignore non-pending linkages or low confidence', async () => {
    const lowConfLinkage = { ...mockLinkage, confidence: 50 };
    const confirmedLinkage = { ...mockLinkage, investigatorStatus: 'confirmed' as const };

    let fetchCount = 0;
    const mockFetchCase = async (id: string) => {
      fetchCount++;
      return id === 'c1' ? mockCaseA : mockCaseB;
    };

    predictAndPrefetchCases([lowConfLinkage, confirmedLinkage], mockFetchCase);

    await new Promise(resolve => setTimeout(resolve, 10));

    assert.strictEqual(fetchCount, 0); // No fetches should be triggered
  });
});
