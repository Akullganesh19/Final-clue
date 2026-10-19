import { Case, Linkage, CaseCluster } from '../types';

export function generateCaseClusters(cases: Case[], linkages: Linkage[]): CaseCluster[] {
  if (!linkages || linkages.length === 0) {
    return [];
  }

  const adj = new Map<string, string[]>();
  const caseMap = new Map<string, Case>();

  cases.forEach(c => {
    caseMap.set(c.id, c);
    adj.set(c.id, []);
  });

  linkages.forEach(l => {
    if (!caseMap.has(l.caseA.id)) {
      caseMap.set(l.caseA.id, l.caseA);
      adj.set(l.caseA.id, []);
    }
    if (!caseMap.has(l.caseB.id)) {
      caseMap.set(l.caseB.id, l.caseB);
      adj.set(l.caseB.id, []);
    }

    const adjA = adj.get(l.caseA.id);
    if (adjA) {
      adjA.push(l.caseB.id);
    }
    const adjB = adj.get(l.caseB.id);
    if (adjB) {
      adjB.push(l.caseA.id);
    }
  });

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  adj.forEach((_neighbors, nodeId) => {
    if (!visited.has(nodeId)) {
      const clusterCaseIds: string[] = [];
      const queue: string[] = [nodeId];
      visited.add(nodeId);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        clusterCaseIds.push(curr);

        const currNeighbors = adj.get(curr) || [];
        currNeighbors.forEach(neighbor => {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        });
      }

      if (clusterCaseIds.length > 1) {
        const clusterCases = clusterCaseIds.map(id => caseMap.get(id)!);
        const clusterCaseIdsSet = new Set(clusterCaseIds);

        const clusterLinkages: Linkage[] = [];
        linkages.forEach(l => {
          if (clusterCaseIdsSet.has(l.caseA.id) && clusterCaseIdsSet.has(l.caseB.id)) {
            clusterLinkages.push(l);
          }
        });

        clusters.push({
          id: `CLUSTER-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          cases: clusterCases,
          linkages: clusterLinkages,
        });
      }
    }
  });

  return clusters;
}
