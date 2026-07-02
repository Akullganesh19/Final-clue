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

// Ensure Web Crypto API is available across environments (browser/Node)
// Using standard conditional to prevent bundler errors
const getCrypto = async () => {
  if (typeof globalThis !== 'undefined' && (globalThis as any).crypto) {
    return (globalThis as any).crypto;
  }
  // Try to use node crypto if available
  try {
     const nodeCrypto = await import('crypto');
     if (nodeCrypto.webcrypto) {
         return nodeCrypto.webcrypto;
     }
  } catch (e) {
      // Ignore
  }
  throw new Error("Web Crypto API is not available in this environment. Ensure Node v19+ or a modern browser is used.");
};

export async function generateAuditHashAsync(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const cryptoAPI = await getCrypto();
  const combined = `${previousHash}|${action}|${details}|${author}|${timestamp}`;
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
  const cryptoAPI = await getCrypto();
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
