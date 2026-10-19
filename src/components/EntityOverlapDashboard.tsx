import React, { useState, useEffect } from 'react';
import { findEntityOverlaps, Overlap } from '../utils/entityCrossReference';
import { Case } from '../types';

interface Props {
  cases: Case[];
}

export function EntityOverlapDashboard({ cases }: Props) {
  const [overlaps, setOverlaps] = useState<Overlap[]>([]);

  useEffect(() => {
    setOverlaps(findEntityOverlaps(cases));
  }, [cases]);

  return (
    <div className="bg-gray-50 p-8 text-gray-900 font-sans mt-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Final Clue: Entity Overlap Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Automatically discovering identical entities (vehicles, weapons, people) that appear across multiple cases.
          </p>
        </header>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Cross-Case Overlaps Found</h2>

          {overlaps.length === 0 ? (
            <p className="text-gray-500 italic">No overlapping entities discovered in the current dataset.</p>
          ) : (
            <div className="space-y-4">
              {overlaps.map((overlap, idx) => (
                <div key={idx} className="p-4 border rounded bg-blue-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                      {overlap.entityType}
                    </span>
                    <span className="text-sm text-gray-500">
                      Appears in {overlap.caseIds.length} cases
                    </span>
                  </div>
                  <div className="text-lg font-medium text-gray-900 mb-2 capitalize">
                    "{overlap.value}"
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {overlap.caseIds.map(id => {
                      const c = cases.find(c => c.id === id);
                      return (
                        <div key={id} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded">
                          <span className="font-semibold">{id}</span>
                          {c && <span className="text-gray-500 ml-1">- {c.title}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
