import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  let redacted = text;
  // Email: j***@gmail.com
  redacted = redacted.replace(/\b([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*(@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, '$1***$2');
  // Credit Card: ****-****-****-1234
  redacted = redacted.replace(/\b(?:\d[ -]*?){11,15}(\d{4})\b/g, '****-****-****-$1');
  // SSN: ***-**-1234
  redacted = redacted.replace(/\b\d{3}[-]?\d{2}[-]?(\d{4})\b/g, '***-**-$1');
  // Phone: ***-***-1234
  redacted = redacted.replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?(\d{4})\b/g, '***-***-$1');
  return redacted;
}

export async function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = JSON.stringify([previousHash, action, details, author, timestamp]);
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'CHK-' + hashHex.toUpperCase().substring(0, 8);
}

export async function createAuditLog(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const redactedDetails = redactPII(details);

  const hash = await generateAuditHash(previousHash, action, redactedDetails, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${crypto.randomUUID()}`,
    timestamp,
    action,
    details: redactedDetails,
    author,
    hash
  };

  return [...logs, newLog];
}
