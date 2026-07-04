import { Case, Linkage, CaseCluster } from '../types';

export function buildCaseClusters(cases: Case[], linkages: Linkage[], minConfidence: number = 50): CaseCluster[] {
  if (!cases || !linkages || cases.length === 0 || linkages.length === 0) {
    return [];
  }

  // Filter linkages by confidence
  const validLinkages = linkages.filter(l => l.confidence >= minConfidence);

  if (validLinkages.length === 0) {
    return [];
  }

  // Build adjacency list graph
  const adjacencyList = new Map<string, Set<string>>();

  // Initialize nodes for all cases involved in valid linkages
  cases.forEach(c => {
    adjacencyList.set(c.id, new Set());
  });

  // Populate edges
  validLinkages.forEach(l => {
    const setA = adjacencyList.get(l.caseA.id);
    const setB = adjacencyList.get(l.caseB.id);

    if (setA && setB) {
      setA.add(l.caseB.id);
      setB.add(l.caseA.id);
    } else {
      // In case cases in linkage are not in the main cases array, though they should be.
      if (!setA) adjacencyList.set(l.caseA.id, new Set([l.caseB.id]));
      else setA.add(l.caseB.id);

      if (!setB) adjacencyList.set(l.caseB.id, new Set([l.caseA.id]));
      else setB.add(l.caseA.id);
    }
  });

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  // DFS to find connected components
  for (const [caseId, edges] of adjacencyList.entries()) {
    // Only process cases that are actually connected to others and haven't been visited
    if (edges.size > 0 && !visited.has(caseId)) {
      const clusterCases = new Set<string>();
      const queue = [caseId];

      // We also need to collect linkages for this cluster
      const clusterLinkages = new Set<Linkage>();

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (!visited.has(currentId)) {
          visited.add(currentId);
          clusterCases.add(currentId);

          const currentEdges = adjacencyList.get(currentId) || new Set();

          for (const neighborId of currentEdges) {
            if (!visited.has(neighborId)) {
               queue.push(neighborId);
            }
          }
        }
      }

      if (clusterCases.size > 1) {
        // Collect case objects
        const resolvedCases = Array.from(clusterCases)
          .map(id => cases.find(c => c.id === id) ||
                     validLinkages.find(l => l.caseA.id === id)?.caseA ||
                     validLinkages.find(l => l.caseB.id === id)?.caseB)
          .filter((c): c is Case => c !== undefined);

        // Collect linkages objects within this cluster
        validLinkages.forEach(l => {
          if (clusterCases.has(l.caseA.id) && clusterCases.has(l.caseB.id)) {
            clusterLinkages.add(l);
          }
        });

        const resolvedLinkages = Array.from(clusterLinkages);

        let avgConf = 0;
        if (resolvedLinkages.length > 0) {
          avgConf = resolvedLinkages.reduce((sum, l) => sum + l.confidence, 0) / resolvedLinkages.length;
        }

        clusters.push({
          id: `CLUSTER-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          cases: resolvedCases,
          linkages: resolvedLinkages,
          averageConfidence: avgConf
        });
      }
    }
  }

  // Sort clusters by size (largest first) then by confidence
  return clusters.sort((a, b) => {
    if (b.cases.length !== a.cases.length) {
      return b.cases.length - a.cases.length;
    }
    return b.averageConfidence - a.averageConfidence;
  });
}
