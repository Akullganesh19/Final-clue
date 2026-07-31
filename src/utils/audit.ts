import { AuditTrail } from '../types';

export async function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return 'CHK-' + hashHex;
}

export async function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = await generateAuditHash(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${globalThis.crypto.randomUUID()}`,
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}
