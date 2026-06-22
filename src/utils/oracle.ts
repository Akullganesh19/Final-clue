import { dedupedFetch } from './apiClient';
import { Case, Linkage } from '../types';

/**
 * ORACLE PREDICTION ENGINE
 * Signal: User hovering or viewing a case in the UI.
 * Prediction: The user is likely to click the case to view its linkages.
 * Action: Prefetch the linkages for that case silently in the background,
 *         so when they do click, the data is already in cache (thanks to dedupedFetch)
 *         and feels instantaneous.
 */
export function predictNextAction(caseId: string) {
  try {
    // We attempt to prefetch the linkages for this case ID.
    // Since dedupedFetch caches the promise, subsequent calls by the actual UI
    // will just return the resolved (or in-flight) promise.
    // Degrades gracefully: if this fails, we just ignore the error, and the UI
    // will fetch it normally later (and handle its own errors).
    dedupedFetch<Linkage[]>(`/api/linkages/${caseId}`).catch((err) => {
       console.warn(`Oracle prediction failed for case ${caseId}:`, err);
    });
  } catch (error) {
    // Catch-all for any sync issues (e.g., if dedupedFetch threw immediately)
  }
}
