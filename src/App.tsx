import React, { useState, useEffect } from 'react';
import type { Case, Linkage } from './types';
import { useLinkagePrediction } from './hooks/useLinkagePrediction';

function App() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [linkages, setLinkages] = useState<Linkage[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Oracle Prediction Engine
  const { cache, prefetchLinkedCases } = useLinkagePrediction();

  useEffect(() => {
    fetch('/api/cases')
      .then(res => res.json())
      .then(data => {
        setCases(data);
        setLoadingList(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;

    const fetchCaseDetails = async () => {
      setLoadingDetail(true);
      try {
        // Oracle: Use cache if available (instant load!), else fetch normally
        if (cache[selectedCaseId]) {
          setSelectedCase(cache[selectedCaseId]);
          console.log('🛸 Oracle: Loaded from cache instantly');
        } else {
          const caseRes = await fetch(`/api/cases/${selectedCaseId}`);
          setSelectedCase(await caseRes.json());
        }

        const linkRes = await fetch(`/api/cases/${selectedCaseId}/linkages`);
        const linkData = await linkRes.json();
        setLinkages(linkData);

        // Oracle: Trigger prediction engine for the next logical action
        prefetchLinkedCases(linkData, selectedCaseId);
      } catch (err) {
        console.error('Error fetching details:', err);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchCaseDetails();
  }, [selectedCaseId, prefetchLinkedCases, cache]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 flex font-sans">
      {/* Sidebar List */}
      <div className="w-1/3 border-r border-slate-700 pr-6">
        <h1 className="text-2xl font-bold mb-6 text-white">Cold Cases</h1>
        {loadingList ? (
          <p className="text-slate-500 animate-pulse">Loading cases...</p>
        ) : (
          <ul className="space-y-3">
            {cases.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`w-full text-left p-4 rounded transition-colors ${
                    selectedCaseId === c.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{c.date}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Detail View */}
      <div className="w-2/3 pl-8">
        {!selectedCaseId ? (
          <div className="flex h-full items-center justify-center text-slate-500">
            Select a case to view details
          </div>
        ) : loadingDetail && !cache[selectedCaseId] ? (
           <p className="text-slate-500 animate-pulse">Fetching complete case file...</p>
        ) : selectedCase ? (
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedCase.title}</h2>
            <div className="flex space-x-4 text-sm text-slate-400 mb-6">
              <span>{selectedCase.date}</span>
              <span>•</span>
              <span>{selectedCase.location}</span>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Narrative</h3>
              <p className="text-slate-300">{selectedCase.narrative}</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2 text-white">Modus Operandi</h3>
              <p className="text-slate-300">{selectedCase.moDescription}</p>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-white">Linked Cases</h3>
              {linkages.length === 0 ? (
                <p className="text-slate-500">No linked cases found.</p>
              ) : (
                <div className="space-y-4">
                  {linkages.map(l => {
                    const linkedId = l.caseA.id === selectedCaseId ? l.caseB.id : l.caseA.id;
                    const linkedCaseSummary = l.caseA.id === selectedCaseId ? l.caseB : l.caseA;
                    // Oracle: Visualize to developer when cache is ready
                    const isPrefetched = !!cache[linkedId];

                    return (
                      <div key={l.id} className="bg-slate-800 border border-slate-700 p-4 rounded flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-white">{linkedCaseSummary.title}</div>
                          <div className="text-sm text-green-400 mt-1">{l.confidence}% Match</div>
                          {isPrefetched && (
                            <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded-full mt-2 inline-block">
                              🛸 Ready Instantly
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setSelectedCaseId(linkedId)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition"
                        >
                          View Case
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
