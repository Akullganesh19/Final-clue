import { AuditTrail } from '../types';

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const newLog: AuditTrail = {
    id: `AUDIT-${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    author
  };

  return [...logs, newLog];
}