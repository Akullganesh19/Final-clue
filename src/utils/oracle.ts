import { AuditTrail } from '../types';

export class ActionPredictor {
  private static instance: ActionPredictor;
  // A Markov chain: map from an action to a map of subsequent actions and their counts
  private transitionMatrix: Map<string, Map<string, number>> = new Map();
  // We keep a small cache to remember recent data without fetching
  private predictionCache: Map<string, { data: any; expiry: number }> = new Map();
  private readonly CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  public static getInstance(): ActionPredictor {
    if (!ActionPredictor.instance) {
      ActionPredictor.instance = new ActionPredictor();
    }
    return ActionPredictor.instance;
  }

  /**
   * Trains the Markov model on the provided audit trail history.
   * Finds sequences of actions to build probabilities for the next action.
   */
  public train(logs: AuditTrail[]): void {
    if (logs.length < 2) return;

    for (let i = 0; i < logs.length - 1; i++) {
      const currentAction = logs[i].action;
      const nextAction = logs[i + 1].action;

      if (!this.transitionMatrix.has(currentAction)) {
        this.transitionMatrix.set(currentAction, new Map());
      }

      const transitions = this.transitionMatrix.get(currentAction)!;
      transitions.set(nextAction, (transitions.get(nextAction) || 0) + 1);
    }
  }

  /**
   * Predicts the most likely next action based on the current action.
   */
  public predictNextAction(currentAction: string): string | null {
    const transitions = this.transitionMatrix.get(currentAction);
    if (!transitions || transitions.size === 0) return null;

    let mostLikelyAction: string | null = null;
    let maxCount = -1;

    for (const [action, count] of transitions.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostLikelyAction = action;
      }
    }

    return mostLikelyAction;
  }

  /**
   * Predicts and optionally pre-fetches data or pre-computes state for the predicted next action.
   */
  public async prefetch(currentAction: string): Promise<void> {
    const nextAction = this.predictNextAction(currentAction);
    if (!nextAction) return;

    console.log(`[Oracle] Predicting next action: ${nextAction} after ${currentAction}`);

    // Map predicted actions to a prefetch URL or operation
    let urlToPrefetch = '';
    if (nextAction === 'VIEW_CASE_DETAILS') {
      // In a real app we would know the case ID, but this demonstrates the concept
      // We might prefetch a generic recent cases list if specific ID is unknown
      urlToPrefetch = '/api/cases/recent';
    } else if (nextAction === 'RUN_SIMILARITY_SEARCH') {
      urlToPrefetch = '/api/models/similarity/warmup';
    } else if (nextAction === 'EXPORT_REPORT') {
      // Prefetch user's preferences for export
      urlToPrefetch = '/api/user/preferences/export';
    }

    if (urlToPrefetch) {
      this.doPrefetch(urlToPrefetch);
    }
  }

  private async doPrefetch(url: string) {
    // Skip if we already have it in cache and it's valid
    const cached = this.predictionCache.get(url);
    if (cached && cached.expiry > Date.now()) {
      return;
    }

    if (typeof window !== 'undefined' && window.fetch) {
      try {
        console.log(`[Oracle] Prefetching predicted resource: ${url}`);
        // We do a non-blocking fetch and keep the response in our memory cache
        const res = await window.fetch(url, {
          // Send minimal credentials if needed, respect auth!
          // We can't prefetch things the user shouldn't see
          headers: {
            'X-Oracle-Prefetch': 'true'
          }
        });

        if (res.ok) {
          const data = await res.json();
          this.predictionCache.set(url, {
            data,
            expiry: Date.now() + this.CACHE_TTL
          });
        }
      } catch (err) {
        console.warn(`[Oracle] Failed to prefetch ${url}:`, err);
        // Degrades gracefully silently
      }
    }
  }
}
