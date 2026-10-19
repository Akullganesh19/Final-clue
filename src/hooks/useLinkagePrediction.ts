import { useState, useCallback, useRef } from 'react';
import type { Linkage, Case } from '../types';

/**
 * 🛸 Oracle Prediction: Behavioral Linkage Prefetching
 * Investigators looking at a case ALMOST ALWAYS click on high-confidence linked cases next.
 * Instead of waiting for the click, we fetch and cache those linked cases in the background
 * the moment the linkages load.
 * If prediction fails, the app falls back to normal fetch-on-click gracefully.
 */
export function useLinkagePrediction() {
  const [cache, setCache] = useState<Record<string, Case>>({});
  const inFlight = useRef<Set<string>>(new Set());

  const prefetchLinkedCases = useCallback(async (linkages: Linkage[], currentCaseId: string) => {
    // Prediction signal: only prefetch high-confidence links to save bandwidth
    const likelyNextCases = linkages
      .filter(l => l.confidence > 80)
      .map(l => (l.caseA.id === currentCaseId ? l.caseB.id : l.caseA.id));

    for (const caseId of likelyNextCases) {
      if (cache[caseId] || inFlight.current.has(caseId)) continue;

      inFlight.current.add(caseId);
      try {
        const response = await fetch(`/api/cases/${caseId}`);
        if (!response.ok) throw new Error('Prefetch failed');
        const data: Case = await response.json();

        setCache(prev => ({ ...prev, [caseId]: data }));
      } catch (error) {
        // Graceful degradation: If prefetch fails, silently ignore.
        // Normal click will just trigger a standard loading state.
        console.warn(`Oracle: Prefetch failed for case ${caseId}`, error);
      } finally {
        inFlight.current.delete(caseId);
      }
    }
  }, [cache]);

  return { cache, prefetchLinkedCases };
}
