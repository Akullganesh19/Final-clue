import { AuditTrail } from '../types';

export class ActionPredictor {
  // Markov chain: maps action -> next action -> count
  private markovChain: Map<string, Map<string, number>> = new Map();

  /**
   * Rebuilds the Markov chain based on the full audit trail.
   * State is cleared before rebuilding to prevent quadratic counting.
   */
  public train(history: AuditTrail[]): void {
    this.markovChain.clear();

    if (!history || history.length < 2) return;

    for (let i = 0; i < history.length - 1; i++) {
      const currentAction = history[i].action;
      const nextAction = history[i + 1].action;

      if (!this.markovChain.has(currentAction)) {
        this.markovChain.set(currentAction, new Map());
      }

      const transitions = this.markovChain.get(currentAction)!;
      const count = transitions.get(nextAction) || 0;
      transitions.set(nextAction, count + 1);
    }
  }

  /**
   * Predicts the most likely next action based on the current action.
   */
  public predictNext(currentAction: string): string | null {
    const transitions = this.markovChain.get(currentAction);
    if (!transitions || transitions.size === 0) return null;

    let bestAction: string | null = null;
    let maxCount = -1;

    for (const [nextAction, count] of transitions.entries()) {
      if (count > maxCount) {
        bestAction = nextAction;
        maxCount = count;
      }
    }

    return bestAction;
  }

  /**
   * Triggers a low-priority prefetch if a probable next action is mapped to an endpoint.
   */
  public triggerPrefetch(predictedAction: string): void {
    if (typeof window === 'undefined') return; // Only run in browser

    // Map predicted actions to concrete endpoints
    const endpointMap: Record<string, string> = {
      'VIEW_CASE_LIST': '/api/cases',
      'VIEW_EVIDENCE_LIST': '/api/evidence',
      'VIEW_LINKAGES': '/api/linkages',
      'ANALYZE_CASE': '/api/cases/analyze',
      'SEARCH_CASES': '/api/cases/search'
    };

    const url = endpointMap[predictedAction];
    if (!url) return;

    try {
      // @ts-ignore - priority is not standard on all RequestInit types yet
      fetch(url, {
        priority: 'low',
        credentials: 'include'
      }).catch(() => {
        // Silently ignore prefetch failures (graceful degradation)
      });
    } catch (e) {
      // Graceful degradation for synchronous errors
    }
  }
}

// Global singleton for Next-Action Prediction
export const globalPredictor = new ActionPredictor();
