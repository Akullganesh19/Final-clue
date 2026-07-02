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

// Global scope provides crypto in Node 19+ and modern browsers.
// Using type assertion to prevent TS2339 errors in Node environments lacking DOM typings.
const getCrypto = () => {
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) {
    return (globalThis as any).crypto;
  }
  throw new Error("Web Crypto API is not available in this environment. Ensure Node v19+ or a modern browser is used.");
};

export async function generateAuditHashAsync(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const cryptoAPI = getCrypto();
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
  // Type assertion for TextEncoder to avoid TS errors
  const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : new (globalThis as any).TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await cryptoAPI.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return 'CHK-' + hashHex.toUpperCase();
}

export async function createAuditLogAsync(
  logs: AuditTrail[],
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const cryptoAPI = getCrypto();
  const lastLog = logs[logs.length - 1];
  const previousHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';
  const timestamp = new Date().toISOString();
  const hash = await generateAuditHashAsync(previousHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: cryptoAPI.randomUUID(),
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}
