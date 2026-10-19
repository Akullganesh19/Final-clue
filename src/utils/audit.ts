import { AuditTrail } from '../types';

export function redactPII(text: string): string {
  let redacted = text;

  // Emails: Mask all but first char of username
  redacted = redacted.replace(/([a-zA-Z0-9])([a-zA-Z0-9._%+-]*)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, p1, p2, p3) => {
    return `${p1}***@${p3}`;
  });

  // SSNs: Require exact format
  redacted = redacted.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');

  // Credit Cards: Require separators
  redacted = redacted.replace(/\b(?:\d{4}[ -.]\d{4}[ -.]\d{4}[ -.]\d{4})\b/g, (match) => {
    const last4 = match.slice(-4);
    return `****-****-****-${last4}`;
  });

  // Phone numbers: Require separators, support optional parentheses
  redacted = redacted.replace(/(?:\b|\()(\d{3})(?:[)\s.-]+)(\d{3})(?:[-.\s]+)(\d{4})\b/g, '[REDACTED PHONE]');

  return redacted;
}

export async function generateAuditHashAsync(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  const cryptoAPI = (globalThis as any).crypto;
  const encoder = new ((globalThis as any).TextEncoder)();
  const data = encoder.encode(combined);
  const hashBuffer = await cryptoAPI.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'SHA256-' + hashHex.substring(0, 16).toUpperCase();
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

export async function createAuditLogAsync(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();

  const redactedDetails = redactPII(details);

  const hash = await generateAuditHashAsync(previousHash, action, redactedDetails, author, timestamp);

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