import { AuditTrail } from '../types';

export function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): string {
  const combined = JSON.stringify([previousHash, action, details, author, timestamp]);
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
  idempotencyKey: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  if (!idempotencyKey) {
    throw new Error('idempotencyKey is required for audit logs to prevent duplication.');
  }

  if (logs.some(log => log.idempotencyKey === idempotencyKey)) {
    console.warn(`Duplicate audit log action blocked for idempotencyKey: ${idempotencyKey}`);
    return logs;
  }

  const redactPhone = (text: string) => text.replace(/(?<=^|[^\d])(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})(?=[^\d]|$)/g, '[REDACTED]');

  action = redactPhone(action);
  details = redactPhone(details);
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    idempotencyKey,
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}