import React, { useEffect } from 'react';
import { prefetchPredicted, clearPredictionCache } from './utils/oracle';
import { Case } from './types';

// Mock data to demonstrate integration
const MOCK_CASES: Case[] = [
  {
    id: '1',
    title: 'The Midnight Burglary',
    date: '2023-01-01',
    location: 'Downtown',
    narrative: '...',
    moDescription: 'Night entry via roof',
    moCategories: ['night_entry', 'roof_access'],
    entities: { person: [], vehicle: ['Black Van'], location: [], weapon: ['Crowbar'] },
    status: 'open'
  },
  {
    id: '2',
    title: 'Jewelry Store Heist',
    date: '2023-02-15',
    location: 'Westside',
    narrative: '...',
    moDescription: 'Night entry via back door',
    moCategories: ['night_entry'],
    entities: { person: [], vehicle: ['Black Van'], location: [], weapon: ['Crowbar', '9mm'] },
    status: 'open'
  }
];

// Mock API call
const mockFetchCaseData = async (id: string): Promise<Case | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_CASES.find(c => c.id === id) || null);
    }, 500); // Simulate network delay
  });
};

function App() {
  const currentCase = MOCK_CASES[0]; // Assume we are viewing the first case

  useEffect(() => {
    // Integrate the Oracle Predictor to prefetch related cases in the background
    // when the user views the current case.
    prefetchPredicted(currentCase, MOCK_CASES, mockFetchCaseData)
      .then(() => {
        console.log('Oracle: Finished predictive prefetching background task.');
      })
      .catch(err => {
        console.error('Oracle: prefetch failed', err);
      });

    return () => {
      clearPredictionCache(); // Cleanup if needed (mostly for HMR during dev)
    };
  }, [currentCase]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Final Clue App</h1>
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-2">Current View: {currentCase.title}</h2>
        <p className="text-gray-600 mb-4">Investigator is currently analyzing this case.</p>
        <div className="text-sm text-gray-500 italic">
          * Oracle prediction engine is running in the background, prefetching related cases (e.g., "{MOCK_CASES[1].title}") for instant access next. Check console.
        </div>
      </div>
    </div>
  );
}

export default App;
