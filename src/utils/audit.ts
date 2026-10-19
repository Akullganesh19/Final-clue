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

export class AuditChainConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuditChainConflictError';
  }
}

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)",
  expectedPreviousHash?: string
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedPreviousHash !== undefined && expectedPreviousHash !== previousHash) {
    throw new AuditChainConflictError(
      `Audit chain conflict: expected previous hash ${expectedPreviousHash}, but got ${previousHash}. The audit trail was modified concurrently.`
    );
  }
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

  return [...logs, newLog];
}