import React, { useState, useEffect } from 'react';
import { findCaseClusters } from './utils/clustering';
import { Case, Linkage, CaseCluster } from './types';

export default function App() {
  const [clusters, setClusters] = useState<CaseCluster[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now we just show it handles empty state nicely
    const mockCases: Case[] = [];
    const mockLinkages: Linkage[] = [];

    setClusters(findCaseClusters(mockCases, mockLinkages));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Final Clue - Case Clustering</h1>

      {clusters.length === 0 ? (
        <div className="p-4 bg-gray-100 rounded text-gray-600">
          No case clusters found yet. Link cases together to discover serial macro patterns.
        </div>
      ) : (
        <div className="grid gap-4">
          {clusters.map(cluster => (
            <div key={cluster.id} className="border p-4 rounded shadow-sm">
              <h2 className="text-xl font-semibold">{cluster.id}</h2>
              <p>Cases: {cluster.cases.length}</p>
              <p>Average Confidence: {cluster.averageConfidence.toFixed(2)}%</p>
              <p>Common MOs: {cluster.commonMoCategories.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
