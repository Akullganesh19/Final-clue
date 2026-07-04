import { AuditTrail } from '../types';
import { globalPredictor } from './oracle';

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

  // Asynchronously train the Next-Action Prediction engine and trigger prefetch
  // so it doesn't block the primary audit log creation thread
  setTimeout(() => {
    try {
      globalPredictor.train(updatedLogs);
      const nextProbableAction = globalPredictor.predictNext(action);
      if (nextProbableAction) {
        globalPredictor.triggerPrefetch(nextProbableAction);
      }
    } catch (e) {
      // Fail silently to prevent disrupting the core audit trail functionality
    }
  }, 0);

  return updatedLogs;
}