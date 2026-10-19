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
 * Legacy non-atomic log creator.
 * Deprecated: susceptible to race conditions if used concurrently without locking.
 */
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

  return [...logs, newLog];
}

/**
 * AuditLedger provides an atomic way to append logs to a sequence,
 * ensuring no logs are lost or hash chains forked when multiple
 * async operations attempt to log simultaneously.
 */
export class AuditLedger {
  private logs: AuditTrail[];
  private lock: Promise<void>;

  constructor(initialLogs: AuditTrail[] = []) {
    this.logs = [...initialLogs];
    this.lock = Promise.resolve();
  }

  public getLogs(): AuditTrail[] {
    return [...this.logs];
  }

  public async appendLog(
    action: string,
    details: string,
    author: string = "Investigator (Arjun Som)"
  ): Promise<AuditTrail> {
    // Acquire the lock (wait for previous operation to finish)
    const release = await this.acquireLock();

    try {
      const lastLog = this.logs[this.logs.length - 1];
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

      this.logs.push(newLog);
      return newLog;
    } finally {
      release();
    }
  }

  private async acquireLock(): Promise<() => void> {
    let releaseLock: () => void;
    const nextLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });

    const previousLock = this.lock;
    this.lock = nextLock;

    await previousLock;

    // @ts-ignore
    return releaseLock;
  }
}
