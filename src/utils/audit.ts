import { AuditTrail } from '../types';

// 🛸 Oracle: Next-Action Prediction Engine
// Builds a Markov chain of action transitions to predict what the user will do next
// and prefetches the necessary resources to make the app feel impossibly ahead.
class ActionPredictor {
  private markovChain = new Map<string, Map<string, number>>();

  // Trains on the entire sequence of logs.
  // Clears state first to prevent quadratic counting of historical transitions.
  public train(logs: AuditTrail[]) {
    this.markovChain.clear();
    for (let i = 0; i < logs.length - 1; i++) {
      const current = logs[i].action;
      const next = logs[i + 1].action;

      if (!this.markovChain.has(current)) {
        this.markovChain.set(current, new Map());
      }
      const transitions = this.markovChain.get(current)!;
      transitions.set(next, (transitions.get(next) || 0) + 1);
    }
  }

  // Predicts the next action given the current action based on highest probability
  public predictNext(currentAction: string): string | null {
    const transitions = this.markovChain.get(currentAction);
    if (!transitions || transitions.size === 0) return null;

    let bestAction: string | null = null;
    let maxCount = -1;
    transitions.forEach((count, nextAction) => {
      if (count > maxCount) {
        maxCount = count;
        bestAction = nextAction;
      }
    });
    return bestAction;
  }

  // Prefetch data for the predicted action to make the app feel instant
  public prefetch(predictedAction: string) {
    if (typeof window === 'undefined') return;

    // Explicitly map action names to their corresponding valid API endpoints
    const endpoints: Record<string, string> = {
      'VIEW_CASE': '/api/cases',
      'LINK_CASE': '/api/linkages',
      'VIEW_EVIDENCE': '/api/evidence',
      'RUN_ANALYSIS': '/api/analysis',
      'GENERATE_REPORT': '/api/reports'
    };

    const url = endpoints[predictedAction];
    if (url) {
      // Use low priority and credentials to respect auth boundaries and degrade gracefully
      try {
        fetch(url, { priority: 'low', credentials: 'include' } as any).catch(() => {});
      } catch (e) {
        // Degrade gracefully if fetch throws synchronously
      }
    }
  }
}

export const actionPredictor = new ActionPredictor();


export function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): string {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'CHK-' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action,
    details,
    author,
    hash
  };


  const updatedLogs = [...logs, newLog];

  // Asynchronously train the predictor and trigger prefetching using non-blocking setTimeout
  setTimeout(() => {
    try {
      actionPredictor.train(updatedLogs);
      const nextAction = actionPredictor.predictNext(action);
      if (nextAction) {
        actionPredictor.prefetch(nextAction);
      }
    } catch (e) {
      // Fail silently
    }
  }, 0);

  return updatedLogs;

}