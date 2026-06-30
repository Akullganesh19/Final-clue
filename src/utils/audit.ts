import { AuditTrail } from '../types';

/**
 * @deprecated Use generateSecureAuditHash instead. The 32-bit DJB2 hash is susceptible to collisions and delimiter injection.
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
 * @deprecated Use createSecureAuditLog instead.
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
 * Generates a SHA-256 hash using the Web Crypto API.
 * Uses JSON.stringify for safe serialization to prevent delimiter injection.
 */
export async function generateSecureAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = JSON.stringify([previousHash, action, details, author, timestamp]);
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'SHA256-' + hashHex.toUpperCase();
}

/**
 * Asynchronously creates a secure audit log entry using Web Crypto API.
 */
export async function createSecureAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'SHA256-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = await generateSecureAuditHash(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${crypto.randomUUID()}`,
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}