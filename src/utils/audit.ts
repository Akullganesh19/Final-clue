import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  let redacted = text;

  // Emails (e.g. j***@gmail.com)
  redacted = redacted.replace(/([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]*(@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g, '$1***$2');

  // SSNs (XXX-XX-XXXX)
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, 'XXX-XX-XXXX');

  // Credit Cards (XXXX-XXXX-XXXX-XXXX or XXXX XXXX XXXX XXXX)
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, (match) => {
    const digits = match.replace(/[^0-9]/g, '');
    if (digits.length >= 13 && digits.length <= 16) {
       return 'XXXX-XXXX-XXXX-' + digits.slice(-4);
    }
    return match;
  });

  // Phone numbers (e.g. +1-555-123-4567, (555) 123-4567, 555-123-4567)
  redacted = redacted.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED PHONE]');

  return redacted;
}

export function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): string {
  const combined = JSON.stringify([previousHash, action, details, author, timestamp]);
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

  const redactedAction = redactPII(action);
  const redactedDetails = redactPII(details);
  const redactedAuthor = redactPII(author);

  const hash = generateAuditHash(previousHash, redactedAction, redactedDetails, redactedAuthor, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action: redactedAction,
    details: redactedDetails,
    author: redactedAuthor,
    hash
  };

  return [...logs, newLog];
}
