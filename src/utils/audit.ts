import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  let redacted = text;

  // Redact email (keep first char, replace rest before @ with ***)
  redacted = redacted.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi, (match, p1, p2) => {
    const firstChar = p1.charAt(0);
    return `${firstChar}***@${p2}`;
  });

  // Redact SSN (XXX-XX-1234)
  redacted = redacted.replace(/\b\d{3}-\d{2}-(\d{4})\b/g, 'XXX-XX-$1');

  // Redact Credit Cards with separators (XXXX-XXXX-XXXX-1234)
  redacted = redacted.replace(/\b(?:\d{4}[ -.]){3}(\d{4})\b/g, 'XXXX-XXXX-XXXX-$1');

  // Redact Phone numbers with separators (XXX-XXX-1234)
  redacted = redacted.replace(/(?:\b|\()(?:\d{3})(?:\) |[-.])(?:\d{3})[-.](\d{4})\b/g, 'XXX-XXX-$1');

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
  const redactedDetails = redactPII(details);

  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(previousHash, action, redactedDetails, author, timestamp);

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