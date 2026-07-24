export class NextActionPredictor {
  private transitions: Record<string, Record<string, number>> = {};
  private lastAction: string | null = null;

  train(action: string) {
    if (this.lastAction) {
      if (!this.transitions[this.lastAction]) {
        this.transitions[this.lastAction] = {};
      }
      this.transitions[this.lastAction][action] = (this.transitions[this.lastAction][action] || 0) + 1;
    }
    this.lastAction = action;
  }

  predict(): string | null {
    if (!this.lastAction || !this.transitions[this.lastAction]) return null;
    const possible = this.transitions[this.lastAction];
    let bestAction: string | null = null;
    let maxCount = 0;
    for (const [action, count] of Object.entries(possible)) {
      if (count > maxCount) {
        maxCount = count;
        bestAction = action;
      }
    }
    return bestAction;
  }
}
export const predictor = new NextActionPredictor();
