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
  expectedParentHash: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const actualPreviousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedParentHash !== actualPreviousHash) {
    throw new Error(`Concurrency Drift Detected: Expected parent hash ${expectedParentHash} does not match actual latest hash ${actualPreviousHash}.`);
  }

  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(actualPreviousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${(globalThis as any).crypto.randomUUID()}`,
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}
