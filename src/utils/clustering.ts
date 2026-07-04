import { Case, Linkage, CaseCluster } from '../types';

export function detectClusters(cases: Case[], linkages: Linkage[]): CaseCluster[] {
  const validLinkages = linkages.filter(l => l.investigatorStatus !== 'rejected');

  // Build adjacency list for cases by case ID
  const adjList = new Map<string, string[]>();
  const caseMap = new Map<string, Case>();

  for (const c of cases) {
    adjList.set(c.id, []);
    caseMap.set(c.id, c);
  }

  for (const link of validLinkages) {
    const aId = link.caseA.id;
    const bId = link.caseB.id;
    if (adjList.has(aId) && adjList.has(bId)) {
      adjList.get(aId)!.push(bId);
      adjList.get(bId)!.push(aId);
    }
  }

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  for (const c of cases) {
    if (!visited.has(c.id)) {
      // Start BFS
      const clusterCaseIds: string[] = [];
      const queue = [c.id];
      visited.add(c.id);

      while (queue.length > 0) {
        const currId = queue.shift()!;
        clusterCaseIds.push(currId);

        const neighbors = adjList.get(currId) || [];
        for (const nId of neighbors) {
          if (!visited.has(nId)) {
            visited.add(nId);
            queue.push(nId);
          }
        }
      }

      if (clusterCaseIds.length > 1) {
        const clusterCases = clusterCaseIds.map(id => caseMap.get(id)!);

        // Find common MO categories
        let commonMo = new Set(clusterCases[0].moCategories || []);
        for (let i = 1; i < clusterCases.length; i++) {
          const currentCaseMo = new Set(clusterCases[i].moCategories || []);
          const intersection = new Set<string>();
          for (const mo of commonMo) {
            if (currentCaseMo.has(mo)) {
              intersection.add(mo);
            }
          }
          commonMo = intersection;
        }

        clusters.push({
          id: (globalThis as any).crypto.randomUUID(),
          cases: clusterCases,
          commonMoCategories: Array.from(commonMo)
        });
      }
    }
  }

  return clusters;
}
