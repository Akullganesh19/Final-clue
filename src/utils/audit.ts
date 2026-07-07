import { AuditTrail } from '../types';

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

  const newLogs = [...logs, newLog];

  // Asynchronously train predictor and trigger prefetch
  setTimeout(() => {
    try {
      globalPredictor.train(newLogs);
      const nextAction = globalPredictor.predictNext(action);
      if (nextAction) {
        globalPredictor.prefetch(nextAction);
      }
    } catch (e) {
      // degrade gracefully
    }
  }, 0);

  return newLogs;
}

export class ActionPredictor {
  public markovChain: Map<string, Map<string, number>> = new Map();

  train(logs: AuditTrail[]) {
    this.markovChain.clear();
    for (let i = 0; i < logs.length - 1; i++) {
      const currentAction = logs[i].action;
      const nextAction = logs[i + 1].action;

      if (!this.markovChain.has(currentAction)) {
        this.markovChain.set(currentAction, new Map());
      }

      const transitions = this.markovChain.get(currentAction)!;
      transitions.set(nextAction, (transitions.get(nextAction) || 0) + 1);
    }
  }

  predictNext(currentAction: string): string | null {
    const transitions = this.markovChain.get(currentAction);
    if (!transitions || transitions.size === 0) return null;

    let bestAction: string | null = null;
    let maxCount = -1;

    transitions.forEach((count, action) => {
      if (count > maxCount) {
        maxCount = count;
        bestAction = action;
      }
    });

    return bestAction;
  }

  prefetch(action: string) {
    if (typeof window === 'undefined') return;

    try {
      // In a real app, map actions to actual URLs or components.
      // E.g., 'VIEW_CASE' -> '/api/cases', 'EDIT_EVIDENCE' -> '/api/evidence'
      // Since we don't have visibility into the actual API structure,
      // we use a dynamic fallback, but this would be tailored in prod.
      let endpoint = `/api/actions/${encodeURIComponent(action)}`;
      if (action === 'VIEW_CASE') endpoint = '/api/cases/predicted';
      if (action === 'EDIT_EVIDENCE') endpoint = '/api/evidence/predicted';
      const url = endpoint;
      // Use low priority and include credentials to respect auth boundaries
      const request = new Request(url, {
        priority: 'low'
      } as RequestInit); // type assertion as priority might not be in standard typings yet

      // Attempt to prefetch the predicted next action
      globalThis.fetch(request, { credentials: 'include' }).catch(() => {
        // Degrade gracefully on error
      });
    } catch (error) {
      // Degrade gracefully on synchronous error
    }
  }
}

export const globalPredictor = new ActionPredictor();
