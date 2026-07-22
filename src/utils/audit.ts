import { AuditTrail } from '../types';

function redactPII(text: string): string {
  let redacted = text;
  const phoneRegex = /(?<=^|[^\d])(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}(?=$|[^\d])/g;
  redacted = redacted.replace(phoneRegex, () => '[REDACTED PHONE]');
  const emailRegex = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  redacted = redacted.replace(emailRegex, (match, local, domain) => {
    const firstChar = local.charAt(0);
    return `${firstChar}***@${domain}`;
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
