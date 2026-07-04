import React from 'react';
import { Case, Linkage } from '../types';
import { detectClusters } from '../utils/clustering';

interface ClusterDashboardProps {
  cases: Case[];
  linkages: Linkage[];
}

export function ClusterDashboard({ cases, linkages }: ClusterDashboardProps) {
  const clusters = React.useMemo(() => detectClusters(cases, linkages), [cases, linkages]);

  if (clusters.length === 0) {
    return <div className="empty-state">No macro patterns detected yet.</div>;
  }

  return (
    <div className="cluster-dashboard">
      <h2>Macro Patterns</h2>
      {clusters.map((cluster) => (
        <div key={cluster.id} className="cluster-card" style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <h3>Pattern {cluster.id}</h3>

          <div className="cluster-cases">
            <strong>Cases Involved ({cluster.cases.length}):</strong>
            <ul>
              {cluster.cases.map((c) => (
                <li key={c.id}>Case: {c.title}</li>
              ))}
            </ul>
          </div>

          <div className="cluster-mo">
            <strong>Common Modus Operandi (MO):</strong>
            <ul>
              {cluster.commonMoCategories.map((mo, idx) => (
                <li key={idx}>{mo}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
