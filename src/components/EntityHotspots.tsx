import React from 'react';
import { Case } from '../types';
import { findEntityHotspots } from '../utils/entityHotspots';

interface EntityHotspotsProps {
  cases: Case[];
}

export function EntityHotspots({ cases }: EntityHotspotsProps) {
  const hotspots = findEntityHotspots(cases);

  if (hotspots.length === 0) {
    return (
      <div className="p-4 border border-gray-200 rounded bg-gray-50 text-gray-500 text-center">
        No shared entities found across these cases.
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <div className="bg-gray-100 p-3 font-semibold border-b border-gray-200">
        Cross-Case Entity Hotspots
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-sm text-gray-600 border-b border-gray-200">
            <th className="p-3">Entity</th>
            <th className="p-3">Type</th>
            <th className="p-3">Occurrences</th>
            <th className="p-3">Involved Cases</th>
          </tr>
        </thead>
        <tbody>
          {hotspots.map((hotspot, idx) => (
            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-3 font-medium capitalize">{hotspot.entity}</td>
              <td className="p-3 text-sm text-gray-500 capitalize">{hotspot.type}</td>
              <td className="p-3">
                <span className="inline-flex items-center justify-center bg-red-100 text-red-800 rounded-full px-2 py-0.5 text-xs font-bold">
                  {hotspot.count}
                </span>
              </td>
              <td className="p-3 text-sm text-gray-600 font-mono">
                {hotspot.caseIds.join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
