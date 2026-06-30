import { AuditTrail } from '../types';

export async function generateAuditHash(previousHash: string, action: string, details: string, author: string, timestamp: string): Promise<string> {
  const combined = JSON.stringify([previousHash, action, details, author, timestamp]);
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return 'CHK-' + hashHex.substring(0, 8); // keeping 8 chars for backwards compat? Wait, previous code returned 8 chars
}

export async function createAuditLog(
  logs: AuditTrail[],
  expectedParentHash: string,
  action: string,
  details: string,
  author: string = "Investigator (Arjun Som)"
): Promise<AuditTrail[]> {
  const lastLog = logs[logs.length - 1];
  const actualParentHash = lastLog ? lastLog.hash : 'CHK-ROOT-GENESIS-CHAIN-STABLE';

  if (expectedParentHash !== actualParentHash) {
    throw new Error(`OCC Error: expected parent hash ${expectedParentHash}, but found ${actualParentHash}`);
  }

  const timestamp = new Date().toISOString();
  const hash = await generateAuditHash(actualParentHash, action, details, author, timestamp);

  const newLog: AuditTrail = {
    id: `AUDIT-${crypto.randomUUID()}`,
    timestamp,
    action,
    details,
    author,
    hash
  };

  return [...logs, newLog];
}
