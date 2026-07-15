import { AuditTrail } from '../types';

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();

  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  let hashVal = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hashVal = (hashVal << 5) - hashVal + char;
    hashVal = hashVal & hashVal; // Convert to 32bit integer
  }
  const hash = 'CHK-' + Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0');

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
