import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  let redacted = text;

  // Email: j***@gmail.com
  redacted = redacted.replace(/\b([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, '$1***$2');

  // SSN: ***-***-4567
  redacted = redacted.replace(/\b\d{3}-\d{2}-(\d{4})\b/g, '***-***-$1');

  // Credit Card: ****-****-****-1234 (requires separators to avoid matching 16-digit IDs)
  redacted = redacted.replace(/\b(?:\d{4}[ -]){3}(\d{4})\b/g, '****-****-****-$1');

  // Phone Number: ***-***-4567 (requires separators to avoid matching 10-digit IDs or timestamps)
  redacted = redacted.replace(/\b\d{3}[-.\s]\d{3}[-.\s](\d{4})\b/g, '***-***-$1');

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
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();

  const redactedDetails = redactPII(details);
  const hash = generateAuditHash(previousHash, action, redactedDetails, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${crypto.randomUUID()}`,
    timestamp,
    action,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}