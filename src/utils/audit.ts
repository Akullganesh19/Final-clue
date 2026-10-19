import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;
  let redacted = text;

  // Redact Emails: retain first letter and domain
  redacted = redacted.replace(/([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi, '$1***$2');

  // Redact SSNs: retain last 4 digits
  redacted = redacted.replace(/\b\d{3}-\d{2}-(\d{4})\b/g, '***-**-$1');

  // Redact Phones
  redacted = redacted.replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?(\d{4})\b/g, '***-***-$1');

  // Credit cards
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, (match) => {
    const last4 = match.replace(/[^\d]/g, '').slice(-4);
    return `****-****-****-${last4}`;
  });

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
  const redactedAuthor = redactPII(author);
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(previousHash, action, redactedDetails, redactedAuthor, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action,
    details: redactedDetails,
    author: redactedAuthor,
    hash
  };

  return [...logs, newLog];
}