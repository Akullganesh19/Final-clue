import { AuditTrail } from '../types';

export class ActionPredictor {
  private static instance: ActionPredictor;
  private markovChain: Map<string, Map<string, number>> = new Map();
  private isTraining = false;

  private constructor() {}

  public static getInstance(): ActionPredictor {
    if (!ActionPredictor.instance) {
      ActionPredictor.instance = new ActionPredictor();
    }
    return ActionPredictor.instance;
  }

  /**
   * Trains the Markov chain based on a sequence of audit logs.
   * Finds pairwise actions by the same author in a single session.
   */
  public train(logs: AuditTrail[]): void {
    if (this.isTraining) return;
    this.isTraining = true;

    try {
      if (logs.length < 2) return;

      this.markovChain.clear();

      // Group logs by author (simulating a session)
      const logsByAuthor = logs.reduce((acc, log) => {
        if (!acc[log.author]) acc[log.author] = [];
        acc[log.author].push(log);
        return acc;
      }, {} as Record<string, AuditTrail[]>);

      // Analyze sequential actions per author
      for (const authorLogs of Object.values(logsByAuthor)) {
        // Ensure chronological order
        authorLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        for (let i = 0; i < authorLogs.length - 1; i++) {
          const currentAction = authorLogs[i].action;
          const nextAction = authorLogs[i + 1].action;

          if (!this.markovChain.has(currentAction)) {
            this.markovChain.set(currentAction, new Map());
          }

          const transitions = this.markovChain.get(currentAction)!;
          const currentCount = transitions.get(nextAction) || 0;
          transitions.set(nextAction, currentCount + 1);
        }
      }
    } finally {
      this.isTraining = false;
    }
  }

  /**
   * Predicts the most likely next action based on the given action.
   */
  public predictNextAction(currentAction: string): string | null {
    const transitions = this.markovChain.get(currentAction);
    if (!transitions || transitions.size === 0) return null;

    let maxCount = 0;
    let mostLikelyAction: string | null = null;

    for (const [nextAction, count] of transitions.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostLikelyAction = nextAction;
      }
    }

    return mostLikelyAction;
  }

  /**
   * A prefetch mechanism triggered if the prediction implies an API call or data requirement.
   * This operates in the background.
   */
  public async prefetchPredictedAction(currentAction: string): Promise<void> {
    const predictedAction = this.predictNextAction(currentAction);
    if (!predictedAction) return;

    // Map the predicted logical action to the actual required API data endpoint
    const actionToEndpointMap: Record<string, string> = {
        'VIEW_CASE_LIST': '/api/cases',
        'VIEW_DASHBOARD': '/api/dashboard/stats',
        'ANALYZE_EVIDENCE': '/api/evidence/triage',
        'LINK_CASES': '/api/cases/clusters'
    };

    const endpoint = actionToEndpointMap[predictedAction];

    if (endpoint && typeof window !== 'undefined') {
        try {
            // Fetch silently to pre-warm the browser HTTP cache / memory cache
            await fetch(endpoint, {
              headers: { 'X-Oracle-Prefetch': 'true' }
            });
        } catch (e) {
            // Gracefully degrade on failure without breaking primary flows
        }
    }
  }
}
