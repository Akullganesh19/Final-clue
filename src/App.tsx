import React, { useEffect } from 'react';
import { predictAndPrefetchCases } from './utils/oracle.js';
import { Linkage, Case } from './types';

// Mock fetch function for demonstration purposes
const mockFetchCase = async (id: string): Promise<Case> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        title: `Case ${id}`,
        date: '2020-01-01',
        location: 'Unknown',
        narrative: '',
        moDescription: '',
        moCategories: [],
        entities: { person: [], vehicle: [], location: [], weapon: [] },
        status: 'cold'
      });
    }, 400); // simulate 400ms latency
  });
};

const App = () => {
  useEffect(() => {
    // Simulate loading linkages on app initialization
    const linkages: Linkage[] = [
      {
        id: 'link_1',
        caseA: { id: 'case_1', title: 'Case 1', date: '', location: '', narrative: '', moDescription: '', moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold' },
        caseB: { id: 'case_2', title: 'Case 2', date: '', location: '', narrative: '', moDescription: '', moCategories: [], entities: { person: [], vehicle: [], location: [], weapon: [] }, status: 'cold' },
        confidence: 90,
        signals: { semantic: 1, entity: 1, temporal: 1, mo: 1 },
        evidence: [],
        criticFlags: [],
        summary: '',
        investigatorStatus: 'pending'
      }
    ];

    // Trigger predictive prefetching for high-confidence pending linkages
    predictAndPrefetchCases(linkages, mockFetchCase);
  }, []);

  return <div>App</div>;
};

export default App;
