import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  // Email
  let redacted = text.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, local, domain) => {
    return `${local[0]}***@${domain}`;
  });

  // SSN
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');

  // Credit Card
  redacted = redacted.replace(/\b(?:\d{4}[ -]){3}\d{4}\b/g, '****-****-****-****');

  // Phone
  redacted = redacted.replace(/(?:\b|\()\d{3}(?:\)|-|\.| )\s?\d{3}[-.\s]\d{4}\b/g, '[REDACTED PHONE]');

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
  logs: AuditTrail[] | null | undefined,
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  const safeLogs = logs || [];
  const lastLog = safeLogs[safeLogs.length - 1];
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

  return [...safeLogs, newLog];
}