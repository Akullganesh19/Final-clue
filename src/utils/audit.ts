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

/**
 * Validates the entire audit trail chain from genesis.
 * Performance note: O(N) where N is chain length.
 */
export function verifyAuditTrail(logs: AuditTrail[]): boolean {
  if (logs.length === 0) return true;

  let expectedPreviousHash = 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    const computedHash = generateAuditHash(
      expectedPreviousHash,
      log.action,
      log.details,
      log.author,
      log.timestamp
    );

    if (computedHash !== log.hash) {
      return false;
    }

    expectedPreviousHash = log.hash;
  }

  return true;
}

/**
 * Appends a new log to the audit trail securely.
 *
 * To prevent race conditions in asynchronous read-modify-write cycles,
 * this function validates that the hash of the expected parent matches the last log.
 * You should pass `expectedParentHash` when you read the array, to ensure no other
 * logs were appended in the background before you write.
 */
export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)",
  expectedParentHash?: string // Idempotency/Concurrency check
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const actualParentHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  // Prevent race conditions: if the caller expects a specific parent, and the array has changed, throw an error.
  if (expectedParentHash !== undefined && expectedParentHash !== actualParentHash) {
    throw new Error(`Concurrency Exception: Audit trail drifted. Expected parent hash ${expectedParentHash}, but found ${actualParentHash}.`);
  }

  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(actualParentHash, action, details, author, timestamp);

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
