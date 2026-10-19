import { Case, Linkage, CaseCluster } from '../types';

/**
 * Finds macro clusters of linked cases using a graph traversal (connected components).
 *
 * @param cases Array of all cases in the system
 * @param linkages Array of existing confirmed or high-confidence pairwise linkages
 * @returns Array of CaseClusters representing grouped case patterns
 */
export function findCaseClusters(cases: Case[], linkages: Linkage[]): CaseCluster[] {
  // Build adjacency list for undirected graph of cases based on linkages
  const adjacencyList = new Map<string, string[]>();

  cases.forEach(c => adjacencyList.set(c.id, []));

  linkages.forEach(link => {
    // Only consider linkages that aren't rejected
    if (link.investigatorStatus !== 'rejected') {
      adjacencyList.get(link.caseA.id)?.push(link.caseB.id);
      adjacencyList.get(link.caseB.id)?.push(link.caseA.id);
    }
  });

  const visited = new Set<string>();
  const clusters: CaseCluster[] = [];

  for (const startCase of cases) {
    if (!visited.has(startCase.id)) {
      // Find connected component
      const componentCaseIds = new Set<string>();
      const queue = [startCase.id];
      visited.add(startCase.id);

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        componentCaseIds.add(currentId);

        const neighbors = adjacencyList.get(currentId) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      // We only care about clusters of 2 or more cases
      if (componentCaseIds.size > 1) {
        const clusterCases = cases.filter(c => componentCaseIds.has(c.id));

        // Find all linkages that belong completely within this cluster
        const clusterLinkages = linkages.filter(link =>
          componentCaseIds.has(link.caseA.id) && componentCaseIds.has(link.caseB.id)
        );

        // Calculate macro signals by averaging the linkage signals
        const totalSemantic = clusterLinkages.reduce((sum, link) => sum + link.signals.semantic, 0);
        const totalEntity = clusterLinkages.reduce((sum, link) => sum + link.signals.entity, 0);
        const totalTemporal = clusterLinkages.reduce((sum, link) => sum + link.signals.temporal, 0);
        const totalMo = clusterLinkages.reduce((sum, link) => sum + link.signals.mo, 0);

        const linkageCount = clusterLinkages.length || 1; // prevent division by zero

        clusters.push({
          id: (globalThis as any).crypto.randomUUID(),
          cases: clusterCases,
          linkages: clusterLinkages,
          macroSignals: {
            semantic: Math.round(totalSemantic / linkageCount),
            entity: Math.round(totalEntity / linkageCount),
            temporal: Math.round(totalTemporal / linkageCount),
            mo: Math.round(totalMo / linkageCount),
          },
          summary: `Macro pattern grouping ${clusterCases.length} cases based on ${clusterLinkages.length} linkages.`
        });
      }
    }
  }

  return clusters;
}
