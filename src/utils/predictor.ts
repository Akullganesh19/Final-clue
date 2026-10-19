import { AuditTrail } from '../types';

export class NextActionPredictor {
  private transitionMatrix: Record<string, Record<string, number>> = {};

  constructor(logs: AuditTrail[] = []) {
    this.train(logs);
  }

  public train(logs: AuditTrail[]): void {
    if (logs.length < 2) return;

    // We only need to learn from the latest transition to avoid recounting history on every action
    // In a real app, you might want to recount or keep a running tally. We'll update the tally based on the whole array for simplicity, but optimized to only train on the last transition if the array grows by 1.
    // However, if given a full array (e.g. initial load), we train on all of it.

    // To keep it simple and correct, we just recount everything.
    this.transitionMatrix = {};

    for (let i = 0; i < logs.length - 1; i++) {
      const currentAction = logs[i].action;
      const nextAction = logs[i + 1].action;

      if (!this.transitionMatrix[currentAction]) {
        this.transitionMatrix[currentAction] = {};
      }

      if (!this.transitionMatrix[currentAction][nextAction]) {
        this.transitionMatrix[currentAction][nextAction] = 0;
      }

      this.transitionMatrix[currentAction][nextAction]++;
    }
  }

  public predict(currentAction: string): string | null {
    const transitions = this.transitionMatrix[currentAction];

    if (!transitions || Object.keys(transitions).length === 0) {
      return null; // Graceful degradation
    }

    let mostLikelyNextAction: string | null = null;
    let maxCount = -1;

    for (const [nextAction, count] of Object.entries(transitions)) {
      if (count > maxCount) {
        maxCount = count;
        mostLikelyNextAction = nextAction;
      }
    }

    if (mostLikelyNextAction) {
      console.log(`[Predictor] Prefetch intent: User likely to ${mostLikelyNextAction} after ${currentAction}`);
      // In a full React app, this is where we would trigger actual API prefetches or pre-render UI.
    }

    return mostLikelyNextAction;
  }
}
