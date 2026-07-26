
function redactPII(text: string): string {
  if (typeof text !== 'string') return text;
  let redacted = text;
  redacted = redacted.replace(/\b([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, '$1***@$2');
  redacted = redacted.replace(/\b\d{3}[-\s]?\d{2}[-\s]?(\d{4})\b/g, '***-**-$1');
  redacted = redacted.replace(/(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?(\d{4}))\b/g, '***-***-$1');
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, (match) => {
    const digits = match.replace(/[ -]/g, '');
    if (digits.length >= 13 && digits.length <= 16) {
      return '****-****-****-' + digits.slice(-4);
    }
    return match;
  });
  return redacted;
}

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

export function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): AuditTrail[] {
  details = redactPII(details);
  author = redactPII(author);
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = generateAuditHash(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}