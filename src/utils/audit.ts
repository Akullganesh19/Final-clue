import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  let redacted = text;

  // Email: j***@gmail.com
  redacted = redacted.replace(/\b([a-zA-Z0-9])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, '$1***$2');

  // SSN: ***-**-****
  redacted = redacted.replace(/\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g, '***-**-****');

  // Phone: ***-***-1234
  // We don't use \b at the start to allow for (555) 123-4567, capturing the entire phone number format including parens if any.
  redacted = redacted.replace(/(?:\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}\b/g, (match) => {
    const digitsOnly = match.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 10) {
      return `***-***-${digitsOnly.slice(-4)}`;
    }
    return match;
  });

  // Credit Card
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, (match) => {
    const digitsOnly = match.replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 13 && digitsOnly.length <= 16) {
        return `****-****-****-${digitsOnly.slice(-4)}`;
    }
    return match;
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
  const redactedAction = redactPII(action);
  const redactedDetails = redactPII(details);

  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();

  // Always use redacted fields for hashing
  const hash = generateAuditHash(previousHash, redactedAction, redactedDetails, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action: redactedAction,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}
