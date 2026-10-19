import { AuditTrail } from '../types';

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)",
  idempotencyKey?: string
): AuditTrail[] {
  // Idempotency check: if a log with this exact key already exists, return early to prevent duplicates
  if (idempotencyKey) {
    const existingLog = logs.find(log => log.idempotencyKey === idempotencyKey);
    if (existingLog) {
      return logs;
    }
  }

  const timestamp = new Date().toISOString();

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action,
    details,
    author,
    idempotencyKey
  };

  return [...logs, newLog];
}