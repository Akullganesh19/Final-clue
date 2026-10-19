import { AuditTrail } from '../types';

/**
 * Modern synchronous hash generator using FNV-1a 32-bit algorithm.
 * Replaces the weak legacy string hash to reduce collision risk in audit trails
 * without introducing async contagion to downstream React consumers.
 */
export function generateSecureAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): string {
  const combined = JSON.stringify({ previousHash, action, details, author, timestamp });
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < combined.length; i++) {
    hash ^= combined.charCodeAt(i);
    // 32-bit FNV prime: 16777619
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return 'CHK-V2-' + (hash >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

/**
 * @deprecated Migration to generateSecureAuditHash in progress.
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