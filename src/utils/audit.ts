import { AuditTrail } from '../types';

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

function redactPII(text: string): string {
  let redacted = text;
  // Email
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]');
  // Phone: Requires separators to avoid masking timestamps
  redacted = redacted.replace(/\b(?:\d{3}[-.\s]\d{3}[-.\s]\d{4})\b/g, '[REDACTED PHONE]');
  // SSN
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED SSN]');
  // Credit Card: Requires separators (spaces or dashes)
  redacted = redacted.replace(/\b(?:\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4})\b/g, '[REDACTED CC]');
  return redacted;
}

export function createAuditLog(
  logs: AuditTrail[],
  expectedParentHash: string,
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedParentHash !== previousHash) {
    throw new Error(`OCC check failed: Expected parent hash ${expectedParentHash}, but found ${previousHash}`);
  }

  const timestamp = new Date().toISOString();
  const redactedDetails = redactPII(details);
  const hash = generateAuditHash(previousHash, action, redactedDetails, author, timestamp);

  const newLog: AuditTrail = {
    id: (globalThis as any).crypto.randomUUID(),
    timestamp,
    action,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}
