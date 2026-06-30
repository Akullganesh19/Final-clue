import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  if (!text) return text;

  // Email: preserve first letter and domain
  let redacted = text.replace(/\b([a-zA-Z0-9._%+-])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, (match, firstChar, rest, domain) => {
    return `${firstChar}***@${domain}`;
  });

  // SSN: ***-**-1234
  redacted = redacted.replace(/\b\d{3}-\d{2}-(\d{4})\b/g, '***-**-$1');

  // Phone: ***-***-4567, (123) 456-7890, 123.456.7890, 123 456 7890
  redacted = redacted.replace(/\b\d{3}[-.]\d{3}[-.](\d{4})\b/g, '***-***-$1');
  redacted = redacted.replace(/\(\d{3}\)\s*\d{3}-(\d{4})\b/g, '***-***-$1');

  // Credit Card: ****-****-****-1234 (handle spaces or dashes)
  redacted = redacted.replace(/\b(?:\d[ -]*?){13,16}\b/g, (match) => {
    const digitsOnly = match.replace(/[ -]/g, '');
    if (digitsOnly.length >= 13 && digitsOnly.length <= 16) {
      const last4 = digitsOnly.slice(-4);
      return `****-****-****-${last4}`;
    }
    return match;
  });

  return redacted;
}

export async function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = JSON.stringify([previousHash, action, details, author, timestamp]);
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'CHK-' + hashHex.substring(0, 8).toUpperCase();
}

export async function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const redactedAction = redactPII(action);
  const redactedDetails = redactPII(details);

  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = await generateAuditHash(previousHash, redactedAction, redactedDetails, author, timestamp);

  const newLog: AuditTrail = {
    id: crypto.randomUUID(),
    timestamp,
    action: redactedAction,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}