import React, { useState, useEffect } from 'react';
import type { Case, Linkage } from './types';
import { predictNextAction, getLinkages } from './utils/oracle';

export default function App() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [linkages, setLinkages] = useState<Linkage[] | null>(null);
  const [loadingLinkages, setLoadingLinkages] = useState(false);

  useEffect(() => {
    fetch('/api/cases')
      .then(res => res.json())
      .then(data => setCases(data))
      .catch(err => console.error("Failed to fetch cases", err));
  }, []);

  const handleSelectCase = (c: Case) => {
    setSelectedCase(c);
    setLinkages(null); // Reset linkages view
    // 🛸 ORACLE: Trigger prediction the moment user selects a case
    predictNextAction(c.id);
  };

  const handleViewLinkages = async () => {
    if (!selectedCase) return;
    setLoadingLinkages(true);
    try {
      // 🛸 ORACLE: This will likely resolve instantly from cache
      const data = await getLinkages(selectedCase.id);
      setLinkages(data);
    } catch (err) {
      console.error("Failed to fetch linkages", err);
    } finally {
      setLoadingLinkages(false);
    }
  };

  return (
    <div className="p-8 font-sans">
      <h1 className="text-3xl font-bold mb-6">Final Clue - Cold Cases</h1>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Case List</h2>
          <ul className="space-y-4">
            {cases.map(c => (
              <li
                key={c.id}
                className={`p-4 border rounded cursor-pointer hover:bg-gray-50 ${selectedCase?.id === c.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => handleSelectCase(c)}
              >
                <div className="font-medium text-lg">{c.title}</div>
                <div className="text-sm text-gray-500">{c.date} - {c.location}</div>
                <div className="text-xs uppercase bg-gray-200 inline-block px-2 py-1 rounded mt-2">{c.status}</div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Case Details</h2>
          {selectedCase ? (
            <div className="border p-6 rounded shadow-sm">
              <h3 className="text-2xl font-bold mb-2">{selectedCase.title}</h3>
              <p className="text-gray-700 mb-4">{selectedCase.narrative}</p>

              <h4 className="font-semibold mb-1">Modus Operandi</h4>
              <p className="text-gray-600 mb-4">{selectedCase.moDescription}</p>


              <div className="mt-8 border-t pt-4">
                {!linkages ? (
                  <button
                    onClick={handleViewLinkages}
                    disabled={loadingLinkages}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingLinkages ? 'Loading...' : 'View Linkage Analysis'}
                  </button>
                ) : (
                  <div>
                    <h4 className="font-semibold mb-2">Linkage Analysis (🛸 Instantly loaded)</h4>
                    {linkages.length > 0 ? (
                      <ul className="space-y-3">
                        {linkages.map(link => (
                          <li key={link.id} className="p-3 bg-gray-50 border rounded text-sm">
                            <span className="font-medium text-blue-600">{link.confidence}% match</span>
                            {' '}with Case "{link.caseB.title}"
                            <p className="text-gray-600 mt-1">{link.summary}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic text-sm">No known linkages.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">Select a case to view details.</div>
          )}
        </div>
      </div>
    </div>
  );
}
