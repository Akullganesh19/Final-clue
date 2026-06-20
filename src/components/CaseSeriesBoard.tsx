import React, { useMemo } from 'react';
import { Case, Linkage } from '../types';
import { buildCaseClusters } from '../utils/clustering';
import { Calendar, MapPin, Link2, ShieldAlert } from 'lucide-react';

interface CaseSeriesBoardProps {
  cases: Case[];
  linkages: Linkage[];
}

export const CaseSeriesBoard: React.FC<CaseSeriesBoardProps> = ({ cases, linkages }) => {
  const clusters = useMemo(() => buildCaseClusters(cases, linkages), [cases, linkages]);

  if (clusters.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
        <ShieldAlert className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Serial Patterns Detected</h3>
        <p className="mt-1 text-sm text-gray-500">
          The system hasn't found any confirmed connections spanning multiple cases yet.
          Analyze more linkages to uncover potential series.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Detected Serial Patterns</h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {clusters.length} {clusters.length === 1 ? 'Series' : 'Series'} Found
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((cluster) => (
          <div key={cluster.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{cluster.id}</h3>
                <div className="mt-1 flex items-center text-xs text-gray-500 space-x-2">
                  <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {cluster.timeSpan.start.split('-')[0]} - {cluster.timeSpan.end.split('-')[0]}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                    <Link2 className="w-3 h-3 mr-1" />
                    {cluster.averageConfidence}% Avg Match
                 </div>
              </div>
            </div>

            <div className="p-5 flex-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Timeline ({cluster.cases.length} cases)</h4>
              <div className="space-y-4">
                {cluster.cases.map((c, idx) => (
                  <div key={c.id} className="relative pl-4 border-l-2 border-gray-200 last:border-0 pb-4 last:pb-0">
                    <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5 ring-4 ring-white"></div>
                    <div className="text-sm font-medium text-gray-900">{c.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{new Date(c.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
               <div className="flex items-start text-xs text-gray-600">
                  <MapPin className="w-4 h-4 mr-1.5 text-gray-400 shrink-0 mt-0.5" />
                  <span>{cluster.locations.join(', ')}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
