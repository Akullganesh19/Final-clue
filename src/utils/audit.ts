import { AuditTrail } from '../types';

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const timestamp = new Date().toISOString();

  const newLog: AuditTrail = {
    id: crypto.randomUUID(),
    timestamp,
    action,
    details,
    author
  };

  return [...logs, newLog];
}