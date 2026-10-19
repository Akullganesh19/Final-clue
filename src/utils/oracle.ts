import { AuditTrail } from '../types';

export class ActionPredictor {
  // Markov chain storing transitions: current action -> next action -> count
  private markovChain = new Map<string, Map<string, number>>();

  /**
   * Trains the predictive model using historical audit logs.
   * Rebuilds the transition counts to prevent quadratic counting.
   */
  public train(logs: AuditTrail[]): void {
    this.markovChain.clear();

    if (logs.length < 2) return;

    for (let i = 0; i < logs.length - 1; i++) {
      const currentAction = logs[i].action;
      const nextAction = logs[i + 1].action;

      if (!this.markovChain.has(currentAction)) {
        this.markovChain.set(currentAction, new Map<string, number>());
      }

      const transitions = this.markovChain.get(currentAction)!;
      const currentCount = transitions.get(nextAction) || 0;
      transitions.set(nextAction, currentCount + 1);
    }
  }

  /**
   * Predicts the most likely next action and prefetches its required data.
   */
  public predictAndPrefetch(currentAction: string): void {
    const transitions = this.markovChain.get(currentAction);
    if (!transitions || transitions.size === 0) return;

    // Find the next action with the highest probability/count
    let predictedAction: string | null = null;
    let maxCount = 0;

    transitions.forEach((count, action) => {
      if (count > maxCount) {
        maxCount = count;
        predictedAction = action;
      }
    });

    if (predictedAction) {
      // Execute the prefetch if running in a client environment
      if (typeof window !== 'undefined') {
        try {
          const prefetchUrl = `/api/actions/${encodeURIComponent(predictedAction)}`;
          // Use priority: low and credentials: include to respect auth
          fetch(prefetchUrl, { priority: 'low', credentials: 'include' } as RequestInit)
            .catch(err => {
              // Gracefully handle prefetch errors, do not interrupt main flow
              console.warn(`[Oracle] Failed to prefetch ${predictedAction}:`, err);
            });
        } catch (error) {
          console.warn(`[Oracle] Error initiating prefetch:`, error);
        }
      }
    }
  }
}

// Global singleton instance for the prediction engine
export const actionPredictor = new ActionPredictor();
