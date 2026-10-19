import type { Linkage } from '../types';

/**
 * ORACLE PREDICTIVE ENGINE
 * Signal: Users frequently view case details and immediately want to know if it's linked to other cases.
 * Prediction: Pre-fetch linkage analysis in the background the moment a case is selected.
 */

// Simple in-memory cache for predicted data
const linkageCache = new Map<string, Promise<Linkage[]>>();

export async function predictNextAction(
  caseId: string,
  userHasPermission: boolean = true // Assuming true for this demo, would normally be checked against auth
): Promise<void> {
  // Graceful degradation: No permission, no prediction.
  if (!userHasPermission) {
    console.log(`[Oracle] Skipped predicting linkages for case ${caseId} due to permissions.`);
    return;
  }

  // If we already predicted/cached this, don't refetch
  if (linkageCache.has(caseId)) {
    return;
  }

  console.log(`[Oracle] 🛸 Predicting user will want linkages for case ${caseId}. Prefetching...`);

  // Start the fetch in the background and cache the promise
  const fetchPromise = fetch(`/api/cases/${caseId}/linkages`)
    .then(res => {
      if (!res.ok) throw new Error('Prediction fetch failed');
      return res.json() as Promise<Linkage[]>;
    })
    .catch(err => {
      // Graceful degradation on error: just log and clear from cache so it can be retried manually if needed
      console.warn(`[Oracle] 🛸 Prediction failed for case ${caseId}:`, err);
      linkageCache.delete(caseId);
      return [];
    });

  linkageCache.set(caseId, fetchPromise);
}

// Function to get the predicted data (or fetch it normally if prediction wasn't ready/failed)
export async function getLinkages(caseId: string): Promise<Linkage[]> {
  if (linkageCache.has(caseId)) {
    console.log(`[Oracle] 🛸 Serving linkage data for case ${caseId} from prediction cache!`);
    return linkageCache.get(caseId)!;
  }

  console.log(`[Oracle] 🐢 Prediction missed for case ${caseId}. Standard fetching.`);
  const res = await fetch(`/api/cases/${caseId}/linkages`);
  if (!res.ok) throw new Error('Failed to fetch linkages');
  return res.json();
}
