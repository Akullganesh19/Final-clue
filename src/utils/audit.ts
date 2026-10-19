import { AuditTrail } from '../types';

/**
 * @deprecated Use generateAuditHashAsync instead. This synchronous version uses a weak bitwise hash.
 */
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
 * Modern, cryptographically secure hash generation.
 */
export async function generateAuditHashAsync(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'CHK-' + hashHex.toUpperCase().substring(0, 8);
}

/**
 * @deprecated Use createAuditLogAsync instead. This synchronous version uses a weak bitwise hash.
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
    id: crypto.randomUUID(),
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}

/**
 * Modern, cryptographically secure audit log creation.
 */
export async function createAuditLogAsync(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = await generateAuditHashAsync(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: crypto.randomUUID(),
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}