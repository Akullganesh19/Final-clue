import React, { useEffect, useState } from 'react';
import { Case, Linkage } from './types';
import { dedupedFetch } from './utils/apiClient';
import { predictNextAction } from './utils/oracle';

function App() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [linkages, setLinkages] = useState<Linkage[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingLinkages, setLoadingLinkages] = useState(false);

  useEffect(() => {
    dedupedFetch<Case[]>('/api/cases')
      .then(setCases)
      .catch(console.error)
      .finally(() => setLoadingCases(false));
  }, []);

  const handleCaseClick = (c: Case) => {
    setSelectedCase(c);
    setLoadingLinkages(true);
    dedupedFetch<Linkage[]>(`/api/linkages/${c.id}`)
      .then(setLinkages)
      .catch(console.error)
      .finally(() => setLoadingLinkages(false));
  };

  const handleCaseHover = (c: Case) => {
    // 🛸 Oracle: Predict user will click to view linkages and prefetch them
    predictNextAction(c.id);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Final Clue 🛸</h1>
        <p className="text-gray-600">Cold Case Evidence Triage System</p>
      </header>

      <div className="flex gap-8">
        {/* Case List */}
        <div className="w-1/3 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Cases</h2>
          {loadingCases ? (
            <p>Loading cases...</p>
          ) : (
            <ul className="space-y-4">
              {cases.map((c) => (
                <li
                  key={c.id}
                  className={`p-4 border rounded cursor-pointer transition-colors ${
                    selectedCase?.id === c.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleCaseClick(c)}
                  onMouseEnter={() => handleCaseHover(c)}
                >
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <p className="text-sm text-gray-500">{c.date} | {c.location}</p>
                  <p className="mt-2 text-gray-700 text-sm">{c.narrative}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Details & Linkages */}
        <div className="w-2/3 bg-white p-6 rounded-lg shadow-md">
          {selectedCase ? (
            <>
              <h2 className="text-2xl font-bold mb-2">{selectedCase.title}</h2>
              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase tracking-wide font-semibold mr-2">
                  Status: {selectedCase.status}
                </span>
                <span className="text-gray-500 text-sm">
                  MO: {selectedCase.moDescription}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Linkages</h3>
              {loadingLinkages ? (
                <p>Loading linkages...</p>
              ) : linkages.length > 0 ? (
                <ul className="space-y-4">
                  {linkages.map((l) => {
                    const otherCase = l.caseA.id === selectedCase.id ? l.caseB : l.caseA;
                    return (
                      <li key={l.id} className="p-4 bg-gray-50 rounded border">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold">Linked to: {otherCase.title}</h4>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                            {l.confidence}% Match
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 italic mb-2">"{l.summary}"</p>
                        <div className="text-xs text-gray-500">
                          <strong>Evidence:</strong> {l.evidence.join(', ')}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No linked cases found.</p>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a case to view details and linkages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
