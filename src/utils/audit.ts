import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  let redacted = text;

  // Redact Email (e.g., j***@gmail.com)
  redacted = redacted.replace(/([a-zA-Z0-9])([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, firstLetter, rest, domain) => {
    return `${firstLetter}***@${domain}`;
  });

  // Redact SSN (e.g., ***-**-6789)
  redacted = redacted.replace(/\b\d{3}-\d{2}-(\d{4})\b/g, '***-**-$1');

  // Redact Credit Card (e.g., ****-****-****-3456)
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, (match) => {
    const digitsOnly = match.replace(/[^\d]/g, '');
    if (digitsOnly.length >= 13 && digitsOnly.length <= 16) {
      const last4 = digitsOnly.slice(-4);
      return `****-****-****-${last4}`;
    }
    return match;
  });

  // Redact Phone Number (e.g., ***-***-7890)
  // Replaced regex to match phone numbers without capturing brackets explicitly and properly replace.
  redacted = redacted.replace(/(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g, (match, p1, p2, p3) => {
    // Only redact if it looks like a phone number, avoiding SSN matches
    if (match.includes('-') && match.split('-').length === 3 && match.split('-')[1].length === 2) {
       return match; // It's an SSN format
    }
    return `***-***-${p3}`;
  });

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
  action = redactPII(action);
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
