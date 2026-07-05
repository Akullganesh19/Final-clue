import { AuditTrail } from '../types';

export class ActionPredictor {
  // Markov chain: map of current action -> map of next action -> frequency
  private markovChain: Map<string, Map<string, number>> = new Map();

  /**
   * Trains the model on the full audit trail history.
   * Clears state first to avoid quadratic counting.
   */
  train(logs: AuditTrail[]): void {
    this.markovChain.clear();

    if (!logs || logs.length < 2) return;

    for (let i = 0; i < logs.length - 1; i++) {
      const currentAction = logs[i].action;
      const nextAction = logs[i + 1].action;

      if (!this.markovChain.has(currentAction)) {
        this.markovChain.set(currentAction, new Map());
      }

      const nextActionMap = this.markovChain.get(currentAction)!;
      const count = nextActionMap.get(nextAction) || 0;
      nextActionMap.set(nextAction, count + 1);
    }
  }

  /**
   * Predicts the most likely next action given the current action.
   */
  predictNextAction(currentAction: string): string | null {
    const nextActionMap = this.markovChain.get(currentAction);
    if (!nextActionMap || nextActionMap.size === 0) return null;

    let mostLikelyAction: string | null = null;
    let maxFrequency = -1;

    // Use forEach to iterate to avoid TS2802 iteration issues when compiling target is not strictly es2015+
    nextActionMap.forEach((frequency, action) => {
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        mostLikelyAction = action;
      }
    });

    return mostLikelyAction;
  }

  /**
   * Translates an action name to a prefetchable URL.
   * In a real app, this might be a complex mapping.
   */
  private actionToUrl(action: string): string | null {
    // Example heuristics based on typical application routes/endpoints
    const actionLower = action.toLowerCase();

    if (actionLower.includes('search')) return '/api/search-suggestions';
    if (actionLower.includes('view_case')) return '/api/cases/recent';
    if (actionLower.includes('view_evidence')) return '/api/evidence/categories';
    if (actionLower.includes('link')) return '/api/linkages/suggestions';
    if (actionLower.includes('login') || actionLower.includes('start')) return '/api/dashboard/summary';

    return null;
  }

  /**
   * Attempts to prefetch the resource associated with the predicted next action.
   * Fails gracefully.
   */
  async prefetchForAction(action: string): Promise<void> {
    const nextPredictedAction = this.predictNextAction(action);
    if (!nextPredictedAction) return;

    const url = this.actionToUrl(nextPredictedAction);
    if (!url) return;

    if (typeof window !== 'undefined') {
      try {
        // Absolute or relative URL depending on environment, we assume relative works in browser
        // using priority: 'low' for prefetching and credentials: 'include' to respect auth boundaries
        await fetch(url, {
          priority: 'low',
          credentials: 'include',
          method: 'GET'
        });
        console.log(`[Oracle] Prefetched ${url} for anticipated action: ${nextPredictedAction}`);
      } catch (error) {
        console.warn(`[Oracle] Prefetch failed for ${url}:`, error);
      }
    } else {
        // We're likely in node (testing/SSR). We need absolute URL if we want to fetch,
        // but for safety we'll just log or gracefully degrade if we don't have a known base URL.
        console.log(`[Oracle - Node Environment] Would prefetch ${url} for anticipated action: ${nextPredictedAction}`);
    }
  }
}
