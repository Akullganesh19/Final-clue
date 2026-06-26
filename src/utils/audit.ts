import { AuditTrail } from '../types';

function redactPII(text: string): string {
  if (!text) return text;
  let redacted = text;

  // Credit Cards: ****-****-****-4444
  redacted = redacted.replace(/\b(?:\d{4}[-\s]?){3}(\d{4})\b/g, '****-****-****-$1');

  // SSN: ***-***-6789
  redacted = redacted.replace(/\b\d{3}[-]?\d{2}[-]?(\d{4})\b/g, '***-***-$1');

  // Phone: ***-***-4567
  redacted = redacted.replace(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?(\d{4})\b/g, '***-***-$1');

  // Emails: j***@gmail.com
  redacted = redacted.replace(/([a-zA-Z0-9])[a-zA-Z0-9_.+-]*(@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/g, '$1***$2');

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
  author: string = "Investigator (Arjun Som)",
  expectedPreviousHash?: string
): AuditTrail[] {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedPreviousHash !== undefined && expectedPreviousHash !== previousHash) {
    throw new Error(`OCC failure: expected previous hash ${expectedPreviousHash} but got ${previousHash}`);
  }

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

  return [...logs, newLog];
}