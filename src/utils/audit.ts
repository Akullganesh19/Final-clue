import { AuditTrail } from '../types';
import { ActionPredictor } from './oracle';

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
  expectedParentHash: string,
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const actualPreviousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedParentHash !== actualPreviousHash) {
    throw new Error(`Optimistic Concurrency Control failure: Expected parent hash ${expectedParentHash} but found ${actualPreviousHash}`);
  }

  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(actualPreviousHash, action, details, author, timestamp);

  let uuid;
  try {
    uuid = (globalThis as any).crypto.randomUUID();
  } catch (e) {
    uuid = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  const newLog: AuditTrail = {
    id: uuid,
    timestamp,
    action,
    details,
    author,
    hash
  };

  const updatedLogs = [...logs, newLog];

  // Train predictor and trigger prefetch asynchronously
  setTimeout(() => {
    try {
      const predictor = ActionPredictor.getInstance();
      predictor.train(updatedLogs);
      predictor.prefetch(action);
    } catch (e) {
      console.warn('[Oracle] Failed to execute predictor:', e);
    }
  }, 0);

  return updatedLogs;
}