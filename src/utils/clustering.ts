import { Case, Linkage } from '../types';

export interface CaseCluster {
  id: string;
  cases: Case[];
  averageConfidence: number;
  timeSpan: { start: string; end: string };
  locations: string[];
}

export function buildCaseClusters(cases: Case[], linkages: Linkage[]): CaseCluster[] {
  // Only consider confirmed linkages or those with high confidence if not categorized
  const validLinkages = linkages.filter(
    (l) => l.investigatorStatus === 'confirmed' || (l.investigatorStatus !== 'rejected' && l.confidence >= 75)
  );

  // Build adjacency list for cases that are linked
  const adjacencyList = new Map<string, Set<string>>();
  const linkConfidenceMap = new Map<string, number>();

  const addEdge = (id1: string, id2: string, conf: number) => {
    if (!adjacencyList.has(id1)) adjacencyList.set(id1, new Set());
    if (!adjacencyList.has(id2)) adjacencyList.set(id2, new Set());
    adjacencyList.get(id1)!.add(id2);
    adjacencyList.get(id2)!.add(id1);

    const edgeKey = [id1, id2].sort().join('-');
    linkConfidenceMap.set(edgeKey, conf);
  };

  validLinkages.forEach((link) => {
    addEdge(link.caseA.id, link.caseB.id, link.confidence);
  });

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  const caseMap = new Map(cases.map((c) => [c.id, c]));

  // Find connected components
  for (const caseId of adjacencyList.keys()) {
    if (visited.has(caseId)) continue;

    const component: string[] = [];
    const queue = [caseId];
    visited.add(caseId);

    while (queue.length > 0) {
      const current = queue.shift()!;
      component.push(current);

      const neighbors = adjacencyList.get(current) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    // Only create a cluster if it involves more than 1 case
    if (component.length > 1) {
      const clusterCases = component.map(id => caseMap.get(id)).filter((c): c is Case => c !== undefined);

      if (clusterCases.length !== component.length) {
          // Missing case data for some IDs, skip or handle gracefully. We skip invalid ones.
          continue;
      }

      // Sort cases chronologically
      clusterCases.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Calculate metrics
      let totalConf = 0;
      let confCount = 0;
      for (let i = 0; i < component.length; i++) {
        for (let j = i + 1; j < component.length; j++) {
          const edgeKey = [component[i], component[j]].sort().join('-');
          if (linkConfidenceMap.has(edgeKey)) {
            totalConf += linkConfidenceMap.get(edgeKey)!;
            confCount++;
          }
        }
      }

      const avgConf = confCount > 0 ? Math.round(totalConf / confCount) : 0;
      const locations = Array.from(new Set(clusterCases.map(c => c.location)));

      clusters.push({
        id: `SERIES-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        cases: clusterCases,
        averageConfidence: avgConf,
        timeSpan: {
          start: clusterCases[0].date,
          end: clusterCases[clusterCases.length - 1].date,
        },
        locations,
      });
    }
  }

  return clusters;
}
