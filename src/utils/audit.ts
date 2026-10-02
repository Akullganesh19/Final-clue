import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  // Redact emails
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]');
  // Redact SSNs (strict format xxx-xx-xxxx)
  text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED SSN]');
  // Redact credit cards (requires separators like space or dash to avoid hitting timestamps/IDs)
  text = text.replace(/\b(?:\d{4}[ -]){3}\d{4}\b/g, '[REDACTED CC]');
  // Redact phone numbers (requires separators to avoid hitting timestamps/IDs)
  text = text.replace(/(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g, '[REDACTED PHONE]');
  return text;
}

export async function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return 'CHK-' + hashHex.substring(0, 8); // keeping it 8 chars for backwards compatibility format
}

export async function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  expectedParentHash: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const lastLog = logs[logs.length - 1];
  const actualParentHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedParentHash !== actualParentHash) {
    throw new Error(`Optimistic Concurrency Control failure: Expected parent hash ${expectedParentHash} but found ${actualParentHash}`);
  }

  const timestamp = new Date().toISOString();
  const redactedDetails = redactPII(details);
  const hash = await generateAuditHash(actualParentHash, action, redactedDetails, author, timestamp);

  const newLog: AuditTrail = {
    id: crypto.randomUUID(),
    timestamp,
    action,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}
