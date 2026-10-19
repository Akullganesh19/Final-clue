import React, { useEffect, useState } from 'react';
import { dedupedFetch } from './utils/apiClient.ts';
import { Linkage } from './types.ts';

function App() {
  const [linkages, setLinkages] = useState<Linkage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkages = async () => {
      try {
        const response = await dedupedFetch('/api/linkages');
        if (response.ok) {
          const data = await response.json();
          setLinkages(data);
        }
      } catch (error) {
        console.error('Failed to fetch linkages', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinkages();
  }, []);

  const handleExportCSV = async () => {
    try {
      const response = await dedupedFetch('/api/export/linkages/csv');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'confirmed_linkages.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to export CSV');
      }
    } catch (error) {
      console.error('Error downloading CSV', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Final Clue - Linkages</h1>
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Export Confirmed Linkages (CSV)
          </button>
        </header>

        {loading ? (
          <p>Loading linkages...</p>
        ) : linkages.length === 0 ? (
          <p>No linkages found.</p>
        ) : (
          <div className="space-y-4">
            {linkages.map((linkage) => (
              <div key={linkage.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{linkage.caseA.title} ↔ {linkage.caseB.title}</h2>
                    <p className="text-slate-400 text-sm mt-1">Confidence: {linkage.confidence}%</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    linkage.investigatorStatus === 'confirmed' ? 'bg-green-900 text-green-300' :
                    linkage.investigatorStatus === 'pending' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {linkage.investigatorStatus.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-300">{linkage.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
