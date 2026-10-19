import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  let redacted = text;
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]');
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED SSN]');
  redacted = redacted.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[REDACTED PHONE]');
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED CC]');
  return redacted;
}

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
  author: string = "Investigator (Arjun Som)",
  expectedPreviousHash?: string
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const actualPreviousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedPreviousHash !== undefined && expectedPreviousHash !== actualPreviousHash) {
    throw new Error(`Concurrency conflict: Expected previous hash does not match the actual previous hash`);
  }

  const timestamp = new Date().toISOString();

  const redactedDetails = redactPII(details);

  const hash = generateAuditHash(actualPreviousHash, action, redactedDetails, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}
