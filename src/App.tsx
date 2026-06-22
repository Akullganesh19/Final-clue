import React, { useEffect, useState } from 'react';
import { EntityOverlap } from './utils/entityCrossReference';

export default function App() {
  const [overlaps, setOverlaps] = useState<EntityOverlap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/cases/overlap')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then(data => {
        setOverlaps(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <header className="mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold text-yellow-500">Final Clue</h1>
        <p className="text-gray-400 mt-2">Emergent Intelligence Dashboard</p>
      </header>

      <main>
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Entity Cross-Reference Engine</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Automatically surfacing entities (people, vehicles, weapons, locations) that appear across multiple seemingly unrelated cases.
          </p>

          {loading && <p className="text-gray-500 animate-pulse">Analyzing case data...</p>}

          {error && <p className="text-red-400 bg-red-950 p-3 rounded">Error: {error}</p>}

          {!loading && !error && overlaps.length === 0 && (
            <div className="text-center py-10 bg-gray-950 rounded border border-gray-800 border-dashed">
              <p className="text-gray-500">No overlapping entities found across current cases.</p>
            </div>
          )}

          {!loading && !error && overlaps.length > 0 && (
            <div className="space-y-4">
              {overlaps.map((overlap, idx) => (
                <div key={`${overlap.entityType}-${overlap.entityValue}-${idx}`} className="bg-gray-950 border border-gray-800 p-4 rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 bg-yellow-900 text-yellow-400 text-xs font-medium rounded uppercase tracking-wider">
                        {overlap.entityType}
                      </span>
                      <span className="font-medium text-lg text-white">
                        {overlap.entityValue}
                      </span>
                    </div>
                    <span className="text-sm font-semibold bg-gray-800 px-2 py-1 rounded text-gray-300">
                      {overlap.cases.length} linked cases
                    </span>
                  </div>

                  <div className="mt-2 space-y-2">
                    {overlap.cases.map(c => (
                      <div key={c.id} className="text-sm flex items-start space-x-2">
                        <span className="text-gray-500 shrink-0 font-mono">{c.id}</span>
                        <span className="text-gray-300">{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
