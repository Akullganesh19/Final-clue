import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  let redacted = text;

  // Email: keep first letter, mask rest, keep domain
  redacted = redacted.replace(/\b([a-zA-Z0-9])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, '$1***@$2');

  // Credit Cards: 16 digits, optional dashes/spaces
  redacted = redacted.replace(/\b(?:\d{4}[-\s]?){3}(\d{4})\b/g, '****-****-****-$1');

  // SSN: 3 digits, dash/space, 2 digits, dash/space, 4 digits
  redacted = redacted.replace(/\b\d{3}[-\s]?\d{2}[-\s]?(\d{4})\b/g, '***-**-$1');

  // Phone: Optional country code, optional area code parens
  redacted = redacted.replace(/(?:\+?\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?(\d{4})\b/g, (match, p1) => {
     // Ensure we retain an opening parenthesis if it matched only the phone format inside it
     // But wait, the phone regex matched the open paren `\(?`. So if we replace it entirely,
     // we lose the `(`. A better approach is to keep the parens.
     if (match.startsWith('(')) {
       return `(***-***-${p1}`;
     }
     return `***-***-${p1}`;
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
  const redactedAuthor = redactPII(author);

  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
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