import { AuditTrail } from '../types';

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


function redactPII(text: string): string {
  if (!text) return text;
  let redacted = text;

  // Redact Emails (e.g. "j***@gmail.com")
  redacted = redacted.replace(/\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g, (match, local, domain) => {
    const maskedLocal = local.charAt(0) + '***';
    return `${maskedLocal}@${domain}`;
  });

  // Redact Phone Numbers (e.g. "***-***-1234")
  redacted = redacted.replace(/(?<=^|[^\d])(?:\+?1[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})(?=$|[^\d])/g, (match, p1, p2, p3) => {
    return `***-***-${p3}`;
  });

  // Redact SSN (e.g. "***-**-1234")
  redacted = redacted.replace(/(?<=^|[^\d])(\d{3})-(\d{2})-(\d{4})(?=$|[^\d])/g, (match, p1, p2, p3) => {
    return `***-**-${p3}`;
  });

  return redacted;
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