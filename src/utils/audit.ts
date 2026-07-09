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

const operationCache = new Set<string>();
const TTL_MS = 10000; // 10 seconds

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)",
  operationId?: string
): AuditTrail[] {
  // Idempotency check with O(1) cleanup via timer
  if (operationId) {
    if (operationCache.has(operationId)) {
      return logs; // Duplicate operation, skip appending
    }
    operationCache.add(operationId);
    const timer = setTimeout(() => {
      operationCache.delete(operationId);
    }, TTL_MS);
    // Prevent timer from keeping the Node process alive
    if (typeof timer.unref === 'function') {
      timer.unref();
    }
  }

  const now = Date.now();
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date(now).toISOString();
  const hash = generateAuditHash(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${now}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}
