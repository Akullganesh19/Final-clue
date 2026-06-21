import React, { useState, useEffect } from 'react';
import { Case } from './types';

// 🛸 ORACLE PREDICTIVE PREFETCH
// Predicts what case the investigator will open next and silently preloads it
function usePredictivePrefetch(currentCaseId: string | null) {
  const [prefetchedData, setPrefetchedData] = useState<{id: string, data: any} | null>(null);

  useEffect(() => {
    if (!currentCaseId) return;

    // Call our prediction engine to guess the next action
    fetch('/api/predict-next-case', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentCaseId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.predictedCaseId) {
          // Anticipate the user's next click and fetch the data now
          fetch(`/api/cases/${data.predictedCaseId}`)
            .then(res => res.json())
            .then(caseData => {
              // Cache it in memory. If prediction is wrong, it just goes unused.
              setPrefetchedData({ id: data.predictedCaseId, data: caseData });
            });
        }
      })
      .catch(err => {
        // Degrade gracefully if prediction fails
        console.error("Oracle prediction failed, ignoring", err);
      });
  }, [currentCaseId]);

  return prefetchedData;
}

export default function App() {
  const [cases, setCases] = useState<any[]>([]);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [activeCaseData, setActiveCaseData] = useState<any>(null);

  const prefetchedCase = usePredictivePrefetch(currentCaseId);

  useEffect(() => {
    fetch('/api/cases')
      .then(res => res.json())
      .then(data => setCases(data || []))
      .catch(() => setCases([]));
  }, []);

  const loadCase = (id: string) => {
    setCurrentCaseId(id);

    // If Oracle correctly predicted this action, load it instantly with zero latency
    if (prefetchedCase && prefetchedCase.id === id) {
      console.log('🛸 Oracle: Cache hit! Loading from prefetch instantly.');
      setActiveCaseData(prefetchedCase.data);
      return;
    }

    // Otherwise, normal network load
    fetch(`/api/cases/${id}`)
      .then(res => res.json())
      .then(data => setActiveCaseData(data));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Final Clue - Cold Cases</h1>
      <div className="flex gap-4">
        <div className="w-1/3">
          <h2 className="text-lg font-semibold mb-2">Case List</h2>
          <ul>
            {cases.map(c => (
              <li
                key={c.id}
                className="cursor-pointer text-blue-500 hover:underline mb-1"
                onClick={() => loadCase(c.id)}
              >
                {c.id} - {c.title} ({c.location})
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 border p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Case Details</h2>
          {activeCaseData ? (
            <div>
              <p><strong>ID:</strong> {activeCaseData.id}</p>
              <p><strong>Title:</strong> {activeCaseData.title}</p>
              <p><strong>Location:</strong> {activeCaseData.location}</p>
              <p><strong>MO:</strong> {activeCaseData.moCategories?.join(', ')}</p>
            </div>
          ) : (
            <p>Select a case to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
