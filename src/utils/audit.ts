import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  let redacted = text;

  // Redact Emails: retain first letter, e.g., j***@example.com
  redacted = redacted.replace(/([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '$1***@$2');

  // Redact SSN
  redacted = redacted.replace(/\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g, '***-**-****');

  // Redact Phone numbers (basic US)
  redacted = redacted.replace(/(?:\+?1[-.\s]?)?\(?\b\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '***-***-****');

  // Credit cards
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, '****-****-****-****');

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
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}