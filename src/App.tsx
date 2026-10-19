import React, { useMemo } from 'react';
import { Case } from './types';
import { generateEntityOverlapIndex } from './utils/entityIndex';
import { EntityOverlapView } from './components/EntityOverlapView';

export interface AppProps {
  cases?: Case[];
}

export default function App({ cases = [] }: AppProps) {
  const overlaps = useMemo(() => generateEntityOverlapIndex(cases), [cases]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">Final Clue <span className="text-indigo-600">Nexus</span></h1>
          <p className="text-gray-500 mt-2">Emergent Intelligence Dashboard</p>
        </header>

        <main className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Entity Overlap Analysis</h2>
            <p className="text-gray-600 mt-1 text-sm">
              Automatically detecting connections across {cases.length} cases based on shared entities.
            </p>
          </div>

          <EntityOverlapView overlaps={overlaps} />
        </main>
      </div>
    </div>
  );
}
