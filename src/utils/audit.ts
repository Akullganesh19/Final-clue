import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  let redacted = text;

  // Emails
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL REDACTED]');

  // SSNs: AAA-GG-SSSS
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN REDACTED]');

  // Credit Cards: 16 digits with optional spaces or dashes
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CC REDACTED]');

  // Phone numbers (US style with separators): e.g., (123) 456-7890 or 123-456-7890
  redacted = redacted.replace(/(?:\b|\()\d{3}(?:\)|\b)[ -.]*\d{3}[ -.]*\d{4}\b/g, '[PHONE REDACTED]');

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

export async function generateAuditHashAsync(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  const encoder = new (globalThis as any).TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await (globalThis as any).crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'CHK-' + hashHex.substring(0, 8).toUpperCase();
}

export async function createAuditLogAsync(
  logs: AuditTrail[],
  action: string,
  details: string,
  expectedParentHash: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const lastLog = logs[logs.length - 1];
  const actualPreviousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedParentHash !== actualPreviousHash) {
    throw new Error(`Concurrency Conflict: Expected parent hash ${expectedParentHash} but found ${actualPreviousHash}`);
  }

  const timestamp = new Date().toISOString();
  const redactedDetails = redactPII(details);
  const hash = await generateAuditHashAsync(actualPreviousHash, action, redactedDetails, author, timestamp);

  let randomId;
  try {
    randomId = (globalThis as any).crypto.randomUUID();
  } catch (e) {
    randomId = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  const newLog: AuditTrail = {
    id: randomId,
    timestamp,
    action,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  expectedParentHash: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const actualPreviousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedParentHash !== actualPreviousHash) {
    throw new Error(`Concurrency Conflict: Expected parent hash ${expectedParentHash} but found ${actualPreviousHash}`);
  }

  const timestamp = new Date().toISOString();
  const redactedDetails = redactPII(details);
  const hash = generateAuditHash(actualPreviousHash, action, redactedDetails, author, timestamp);

  let randomId;
  try {
    randomId = (globalThis as any).crypto.randomUUID();
  } catch (e) {
    randomId = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  const newLog: AuditTrail = {
    id: randomId,
    timestamp,
    action,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}