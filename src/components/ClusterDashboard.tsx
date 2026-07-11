import React, { useState } from 'react';
import { Case, Linkage } from '../types';
import { detectSerialClusters, SerialCluster } from '../utils/clusterDetection';

interface ClusterDashboardProps {
  cases?: Case[];
  linkages?: Linkage[];
}

export const ClusterDashboard: React.FC<ClusterDashboardProps> = ({ cases = [], linkages = [] }) => {
  const clusters = detectSerialClusters(cases, linkages);

  if (clusters.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded text-gray-500">
        No serial clusters detected. (Need at least 3 strongly linked cases)
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-4">🌌 Detected Serial Clusters</h2>
      <div className="space-y-4">
        {clusters.map((cluster: SerialCluster) => (
          <div key={cluster.id} className="border p-4 rounded shadow-sm bg-gray-50">
            <h3 className="font-semibold text-lg text-blue-800">{cluster.id}</h3>
            <p className="text-sm text-gray-600 mb-2">Total Confidence Score: {cluster.totalConfidence}</p>
            <div className="mb-3">
              <span className="font-medium text-gray-800">Core Modus Operandi (MO):</span>
              <ul className="list-disc pl-5 text-gray-700 text-sm mt-1">
                {cluster.coreMOs.map(mo => <li key={mo}>{mo}</li>)}
              </ul>
            </div>
            <div>
              <span className="font-medium text-gray-800">Involved Cases ({cluster.cases.length}):</span>
              <ul className="list-disc pl-5 text-gray-700 text-sm mt-1">
                {cluster.cases.map(c => <li key={c.id}>{c.title} ({c.date}) - {c.status}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
