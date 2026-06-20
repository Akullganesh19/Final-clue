import React, { useState, useMemo } from 'react';
import { Case } from '../types';
import { findEntityOverlaps, EntityOverlap } from '../utils/analysis';

interface Props {
  cases: Case[];
}

export const EntityOverlapAnalyzer: React.FC<Props> = ({ cases }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const overlaps = useMemo(() => findEntityOverlaps(cases), [cases]);

  const filteredOverlaps = useMemo(() => {
    if (!searchTerm.trim()) return overlaps;
    const term = searchTerm.toLowerCase();
    return overlaps.filter(o =>
      o.entityName.toLowerCase().includes(term) ||
      o.entityType.toLowerCase().includes(term) ||
      o.cases.some(c => c.title.toLowerCase().includes(term) || c.id.toLowerCase().includes(term))
    );
  }, [overlaps, searchTerm]);

  const typeColors = {
    person: 'bg-blue-100 text-blue-800 border-blue-200',
    vehicle: 'bg-green-100 text-green-800 border-green-200',
    location: 'bg-orange-100 text-orange-800 border-orange-200',
    weapon: 'bg-red-100 text-red-800 border-red-200',
  };

  if (!cases || cases.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Entity Overlap Analyzer</h2>
        <div className="text-gray-500 italic">No cases available for analysis.</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Entity Overlap Analyzer
        </h2>

        <div className="relative">
          <input
            type="text"
            placeholder="Search entities or cases..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {overlaps.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p>No overlapping entities found across cases.</p>
          <p className="text-sm mt-1">This means no persons, vehicles, locations, or weapons appear in more than one case.</p>
        </div>
      ) : filteredOverlaps.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No matches found for "{searchTerm}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-500 mb-2">
            Found {overlaps.length} entities connecting multiple cases
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOverlaps.map((overlap, idx) => (
              <div key={`${overlap.entityType}-${overlap.entityName}-${idx}`} className={`p-4 rounded-lg border ${typeColors[overlap.entityType]} bg-opacity-50`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{overlap.entityName}</h3>
                  <span className="text-xs uppercase tracking-wider font-bold px-2 py-1 rounded bg-white bg-opacity-50">
                    {overlap.entityType}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold mb-1 opacity-75 uppercase tracking-wide">Appears in {overlap.cases.length} cases:</p>
                  <ul className="space-y-1">
                    {overlap.cases.map(c => (
                      <li key={c.id} className="text-sm flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 mr-2"></span>
                        <span className="font-medium mr-2">{c.id}</span>
                        <span className="truncate opacity-80" title={c.title}>{c.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
