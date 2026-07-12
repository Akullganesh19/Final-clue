import React from 'react';
import { EntityMatch } from '../utils/entityIndex';

interface EntityOverlapViewProps {
  overlaps: EntityMatch[];
}

export function EntityOverlapView({ overlaps }: EntityOverlapViewProps) {
  if (!overlaps || overlaps.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
        <p>No entity overlaps detected across the provided cases.</p>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    person: 'bg-blue-100 text-blue-800 border-blue-200',
    vehicle: 'bg-green-100 text-green-800 border-green-200',
    location: 'bg-amber-100 text-amber-800 border-amber-200',
    weapon: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Detected Overlaps</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {overlaps.map((overlap, idx) => (
          <div key={`${overlap.entityType}-${overlap.entityValue}-${idx}`} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900 capitalize">
                "{overlap.entityValue}"
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${typeColors[overlap.entityType] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                {overlap.entityType}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Found in {overlap.cases.length} cases:</p>
              <ul className="space-y-1">
                {overlap.cases.map(c => (
                  <li key={c.id} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>{c.title} <span className="text-gray-400 text-xs">({c.id})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
