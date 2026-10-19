import { AuditTrail } from '../types';

export class ActionPredictor {
  // Map of current action to a Map of subsequent actions and their frequencies
  private transitions: Map<string, Map<string, number>> = new Map();

  /**
   * Trains the predictor using historical AuditTrail sequences.
   */
  train(logs: AuditTrail[]) {
    for (let i = 0; i < logs.length - 1; i++) {
      const currentAction = logs[i].action;
      const nextAction = logs[i + 1].action;

      if (!this.transitions.has(currentAction)) {
        this.transitions.set(currentAction, new Map());
      }

      const nextCounts = this.transitions.get(currentAction)!;
      nextCounts.set(nextAction, (nextCounts.get(nextAction) || 0) + 1);
    }
  }

  /**
   * Predicts the most likely next action given a current action.
   */
  predictNext(currentAction: string): string | null {
    const nextCounts = this.transitions.get(currentAction);

    if (!nextCounts || nextCounts.size === 0) {
      return null; // Degrade gracefully if no data
    }

    let mostLikelyAction: string | null = null;
    let highestFrequency = 0;

    for (const [action, frequency] of nextCounts.entries()) {
      if (frequency > highestFrequency) {
        highestFrequency = frequency;
        mostLikelyAction = action;
      }
    }

    return mostLikelyAction;
  }
}

// Export a singleton instance for cross-cutting utility usage
export const actionPredictor = new ActionPredictor();
